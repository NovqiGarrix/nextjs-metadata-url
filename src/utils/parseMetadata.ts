export default function parseMetadata(doc: Document) {

    const title = doc.title;

    const desc = doc.querySelector("[name=\"description\"]")?.getAttribute("content")
        || doc.querySelector("[name=\"og:description\"]")?.getAttribute("content")
        || doc.querySelector("[name=\"twitter:description\"]")?.getAttribute("content");

    const image = doc.querySelector("[property=\"image\"]")?.getAttribute("content")
        || doc.querySelector("[property=\"og:image\"]")?.getAttribute("content")
        || doc.querySelector("[name=\"twitter:image\"]")?.getAttribute("content");

    const allMetadata = Array.from(doc.querySelectorAll("meta"),
        (el) => ({ name: el.getAttribute("name"), content: el.getAttribute("content") })
    ).filter((value) => value.name !== null && value.content !== null)
        .filter((value) => value.name !== "viewport")
        .filter((value) => value.name !== "theme-color")
        .filter((value) => value.name !== "msapplication-TileColor")
        .filter((value) => value.name !== "next-head-count")
        .filter((value) => value.name !== "theme-color");

    return {
        title, desc, image, allMetadata
    }

}