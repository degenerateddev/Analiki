export const reduceJSON = (data) => {
    const { parse } = data;
    const { title, text, links, externallinks } = parse;
    const linksReduced = links.filter((link) => link.ns === 0).map((link) => link["*"]);

    return {
        title,
        text: text["*"],
        links: linksReduced,
        sources: externallinks
        //categories: categories.map((category) => category["*"])
    };
}