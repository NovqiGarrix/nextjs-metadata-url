/* eslint-disable @next/next/no-img-element */
import { FormEvent, useRef, useState } from "react";

import type { NextPage } from "next";
import Head from "next/head";

import parseMetadata from "../utils/parseMetadata";

interface Metadata {
  title: string;
  desc: string | null | undefined;
  image?: string | null | undefined;
  url: string;
  allMetadata: Array<{
    name: string | null;
    content: string | null;
  }>;
}

const Home: NextPage = () => {
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [metadata, setMetadata] = useState<Metadata | null>(null);

  async function pasteFromClipboard() {
    const text = await navigator.clipboard.readText();
    setUrl(text);
  }

  async function getMetadata(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;

    if (!url) {
      setError("Please enter a valid URL");
      return;
    }

    // Don't fetch if the URL hasn't changed
    if (metadata) {
      const anchorEl = document.createElement("a");
      anchorEl.href = url;

      const currentOrigin = anchorEl.origin;
      const currentPathanme = anchorEl.pathname;

      anchorEl.href = metadata.url;
      const prevOrigin = anchorEl.origin;
      const prevPathname = anchorEl.pathname;

      if (currentOrigin === prevOrigin && currentPathanme === prevPathname) {
        console.log("URL hasn't changed");
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/metadata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const { data, message } = await response.json();
      if (message) {
        setError(message);
        return;
      }

      const domParser = new DOMParser();
      const doc = domParser.parseFromString(data, "text/html");

      const metadataValue = parseMetadata(doc);
      setMetadata({ ...metadataValue, url });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto my-auto flex items-center justify-center h-screen flex-col space-y-5">
      <Head>
        <title>Get Site Metadata</title>
        <meta name="description" content="Get Any Site Metadata" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {isLoading ? (
        <div className="flex flex-col items-center max-w-xs mx-auto text-center">
          <h2 className="text-lg text-red-500 font-bold">
            Getting metadata...
          </h2>
        </div>
      ) : metadata ? (
        <div className="flex flex-col items-center max-w-sm text-center">
          {metadata.image && (
            <img
              src={metadata.image}
              alt={metadata.title}
              className="rounded-xl"
              width={200}
              height={200}
            />
          )}

          <h1 className="text-blue-600 font-bold mt-5">{metadata.title}</h1>
          <p className="text-gray-600 text-sm mt-1">{metadata.desc}</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center max-w-xs mx-auto text-center">
          <h2 className="text-lg text-red-500 font-bold">{error}</h2>
        </div>
      ) : null}

      <form
        onSubmit={getMetadata}
        className="mt-8 space-y-6 merah max-w-sm w-full font-poppins"
      >
        <div className="-space-y-px rounded-md shadow-sm">
          <div>
            <input
              type="text"
              required
              value={url}
              readOnly={isLoading}
              disabled={isLoading}
              onChange={(e) => {
                setUrl(e.target.value);
              }}
              className="relative block w-full appearance-none rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm disabled:cursor-not-allowed"
              placeholder="Enter a url..."
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="submit"
            disabled={isLoading}
            className="relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Get Metadata
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={pasteFromClipboard}
            className="relative flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Paste
          </button>
        </div>
      </form>
    </div>
  );
};

export default Home;
