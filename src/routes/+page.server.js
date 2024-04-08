import { fail } from '@sveltejs/kit';
import { reduceJSON } from '$lib';

/** @type {import('./$types').Actions} */
export const actions = {
    get: async (event) => {
        const data = await event.request.formData();
        const query = data.get("query");

        if (!query) {
            return fail(400, { query, missing: true });
        }

        let url;
        if (query.includes("https://") || query.includes("http://")) {
            // e.g.: https://en.wikipedia.org/wiki/United_States
            // transform default wikipedia links to api queries
            url = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(query.split("/").pop())}&format=json&origin=*`;
        } else {
            url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`;
        }
        
        let response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (response.ok) {
            let data = await response.json();

            if ("parse" in data) {
                let article = reduceJSON(data);
                
                return {
                    article
                };
            }

            if (data.query.searchinfo.totalhits === 0) {
                return fail(404, { error: "No results found..." });
            }

            const title = data.query.search[0].title;
            url = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&format=json&origin=*`;

            response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (response.ok) {
                let article = await response.json();
                article = reduceJSON(article);

                return {
                    article
                };
            }
        }

        return fail(500, { error: "Failed to fetch wiki data..." });
    },

    crawl: async (event) => {
        const data = await event.request.formData();
        const articles = data.get("articles");

        if (!articles) {
            return fail(400, { articles, articles_missing: true });
        }

        const articlesList = articles.split(",");

        if (articlesList.length === 0) {
            return fail(400, { articles, articles_missing: true });
        }

        let fetchPromises = articlesList.map(article => {
            return new Promise((resolve, reject) => {
                const maxRetries = 3;
                let retries = 0;
        
                const fetchWithRetry = () => {
                    const timeout = setTimeout(() => {
                        if (retries < maxRetries) {
                            retries++;
                            console.log(`Retry ${retries} for ${article}`);
                            clearTimeout(timeout);
                            fetchWithRetry();
                        } else {
                            reject(new Error("Request timed out"));
                        }
                    }, 20000); // Set timeout to 20 seconds
        
                    fetch(`https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(article)}&format=json&origin=*`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        }
                    }).then(response => {
                        clearTimeout(timeout);
                        if (response.ok) {
                            return response.json().then(data => {
                                data = reduceJSON(data);
                                console.log(data);
                                resolve(data);
                            });
                        } else {
                            reject(new Error("Response not OK"));
                        }
                    }).catch(error => {
                        if (retries < maxRetries) {
                            retries++;
                            console.log(`Retry ${retries} for ${article}`);
                            clearTimeout(timeout);
                            fetchWithRetry();
                        } else {
                            reject(error);
                        }
                    });
                };
        
                fetchWithRetry();
            });
        });
        
        const allData = await Promise.all(fetchPromises);

        return {
            articles: allData
        };
    }
};