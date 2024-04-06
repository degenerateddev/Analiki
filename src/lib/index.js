export const reduceJSON = (data) => {
    console.log(data)

    const { parse } = data;
    const { title, text, links, externallinks, iwlinks } = parse;

    return {
        title,
        text: text["*"],
        links: links,
        sources: externallinks,
        iwlinks: iwlinks
        //categories: categories.map((category) => category["*"])
    };
}