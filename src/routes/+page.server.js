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

        //https://stackoverflow.com/questions/30381974/wikipedia-api-how-to-get-all-links-from-multiple-pages
        //https://stackoverflow.com/questions/45269278/how-to-continue-to-call-wikipedia-api-the-500-limit
        
        let allData = [];
        let iterations = articlesList.length / 50;
        for (let i = 0; i < iterations; i++) {
            const url = `https://en.wikipedia.org/w/api.php?action=query&prop=links&titles=${articlesList.join("|")}&eilimit=1000000&callback=?&eicontinue=0|2645&pllimit=max&format=json&origin=*`;
        
            let response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);
                const reduced = reduceJSON(data);
                allData.push(reduced);
            }
        }
        
        return {
            articles: allData
        };
    }
};