import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).send({ message: "Method Not Allowed" });
    }

    const { url } = req.body;
    if (!url) return res.status(400).send({ message: "URL is required" });

    // Check is invalid url
    const regex = new RegExp(
        "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
        "i"
    ); // fragment locator
    if (!regex.test(url)) return res.status(400).send({ message: "Invalid URL" });


    try {

        const response = await fetch(url, {
            method: "GET",
        });

        const result = await response.text();
        return res.status(200).send({ data: result });

    } catch (error: any) {
        return res.status(error.status || 500).send({ message: error.message });
    }


}