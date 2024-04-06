import { fail } from '@sveltejs/kit';
import { reduceJSON } from '$lib';

/** @type {import('./$types').Actions} */
export const actions = {
    default: async (event) => {
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
                data = reduceJSON(data);
                
                return {
                    success: true,
                    data
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
                let data = await response.json();
                data = reduceJSON(data);

                return {
                    success: true,
                    data
                };
            }
        }

        return fail(500, { error: "Failed to fetch wiki data..." });
    }
};