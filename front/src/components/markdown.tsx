"use client";

import { useRef } from "react";
import markdownit from "markdown-it";
import { katex } from "@mdit/plugin-katex";
import hljs from "highlight.js";

import "katex/dist/katex.min.css";
import "highlight.js/styles/atom-one-light.css";
import styles from "./markdown.module.scss";

export const mdit = markdownit({
  breaks: true,
  highlight: function (str: string, lang: string): string {

    if (lang == "svg") {

      return `<img src="data:image/svg+xml,${encodeURIComponent(str)}" />`;

    }

    if (lang == "iframe") {

      return `<iframe src="${str}" width="100%" height="400px" />`;

    }

    if (lang == "details") {

      const lines = str.split("\n");

      return `<details><summary>${lines[0]}</summary>${mdit.render(lines.slice(1).join("\n"))}</details>`;

    }

    // グラフの場合

    const graph = lang.match(/^graph\.(.*)$/);

    if (lang == "graph" || graph) {

      const flag = !graph ? "" : graph[1];

      const lines = str.split("\n").filter((v) => v);

      if (lines.length == 0) {

        return `<span class="error">Invalid data (line: 0)</span>`;

      }

      let m = 0, root = "0";

      if (flag.includes('t')) {

        const data = lines[0].match(/^(\d+) (.+)$/);

        if (!data) {

          return `<span class="error">Invalid data (line: 0)</span>`;

        }

        m = parseInt(data![1]);
        root = data![2];

      } else {

        const data = lines[0].match(/^(\d+)$/);

        if (!data) {

          return `<span class="error">Invalid data (line: 0)</span>`;

        }

        m = parseInt(data![2]);

      }

      if (lines.length < m + 1) {

        return `<span class="error">Too few lines</span>`;

      }

      const g: { [key: string]: { to: string, weight: string }[] } = {};

      const edges: { from: string, to: string }[] = [];

      for (let i = 1; i <= m; i++) {

        // 重み付きの場合
        if (flag.includes('w')) {

          const data = lines[i].match(/^(.+) (.+) (.+)$/);

          if (!data) {

            return `<span class="error">Invalid edge (line: ${i})</span>`;

          }

          const a = data![1];
          const b = data![2];
          const c = data![3];

          g[a] = g[a] || [];
          g[b] = g[b] || [];

          edges.push({ from: a, to: b });

          g[a].push({ to: b, weight: c });

          if (!flag.includes('d')) {

            g[b].push({ to: a, weight: c });

          }

        } else {

          const data = lines[i].match(/^(.+) (.+)$/);

          if (!data) {

            return `<span class="error">Invalid edge (line: ${i})</span>`;

          }

          const a = data![1];
          const b = data![2];

          g[a] = g[a] || [];
          g[b] = g[b] || [];

          edges.push({ from: a, to: b });

          g[a].push({ to: b, weight: "" });

          if (!flag.includes('d')) {

            g[b].push({ to: a, weight: "" });

          }

        }

      }

      // 木の場合
      if (flag.includes('t')) {

        const stack: { pos: string, depth: number }[] = [{ pos: root, depth: 0 }];

        const visited: { [key: string]: boolean } = {};

        const depths: string[][] = [];

        while (stack.length != 0) {

          const { pos: v, depth } = stack.pop()!;

          visited[v] = true;

          depths[depth] = depths[depth] || [];
          depths[depth].push(v);

          for (const e of g[v]) {

            if (e.to != root) {

              stack.push({ pos: e.to, depth: depth + 1 });

            }

          }

        }

        const pos: { [key: string]: { x: number, y: number } } = {};

        let maxWidth = 0;

        depths.forEach((depth, i) => {

          depth.reverse().forEach((v, j) => {

            pos[v] = { x: j * 100, y: i * 100 };

          });

          maxWidth = Math.max(maxWidth, depth.length);

        });

        return `<svg class="auto-width" weight="100%" height="500px" viewBox="0 0 ${maxWidth * 100} ${depths.length * 100}" xmlns="http://www.w3.org/2000/svg">`
          + edges.map(({ from, to }) => {
            if (flag.includes('d')) {
              return `<line x1="${pos[from].x + 50}" y1="${pos[from].y + 50}" x2="${pos[to].x + 50}" y2="${pos[to].y + 50}" stroke="black" />`
                + (flag.includes('w') ? `<rect x="${(pos[from].x + pos[to].x) / 2 + 50 - 10}" y="${(pos[from].y + pos[to].y) / 2 + 50 - 10}" width="20" height="20" fill="white" />` : "")
                + (flag.includes('w') ? `<text x="${(pos[from].x + pos[to].x) / 2 + 50}" y="${(pos[from].y + pos[to].y) / 2 + 50}" text-anchor="middle" dominant-baseline="middle" font-size="13">${g[from].find(e => e.to == to)?.weight}</text>` : "")
            } else {
              return `<line x1="${pos[from].x + 50}" y1="${pos[from].y + 50}" x2="${pos[to].x + 50}" y2="${pos[to].y + 50}" stroke="black" />`
                + (flag.includes('w') ? `<rect x="${(pos[from].x + pos[to].x) / 2 + 50 - 10}" y="${(pos[from].y + pos[to].y) / 2 + 50 - 10}" width="20" height="20" fill="white" />` : "")
                + (flag.includes('w') ? `<text x="${(pos[from].x + pos[to].x) / 2 + 50}" y="${(pos[from].y + pos[to].y) / 2 + 50}" text-anchor="middle" dominant-baseline="middle" font-size="13">${g[from].find(e => e.to == to)?.weight}</text>` : "")
            }
          })
          + depths.map((depth, i) => {
            return depth.map((v, j) => {
              return `<circle cx="${j * 100 + 50}" cy="${i * 100 + 50}" r="20" fill="white" stroke="black" />`
                + `<text x="${j * 100 + 50}" y="${i * 100 + 50}" text-anchor="middle" dominant-baseline="middle" font-size="13">${v}</text>`;
            })
          })
          + "</svg>";

      } else {

        // フロー型
        if (flag.includes('f')) {



        }

      }


    }

    // 末尾の改行を削除

    str = str.replace(/\n+$/, '');

    // = フラグを削除

    const showRow = lang.match(/(.*)=/);

    if (showRow) {

      lang = lang.match(/(.*)=/)![1];

    }

    // 言語が対応しているか

    if (lang && hljs.getLanguage(lang)) {

      try {
        return `<pre class="hljs ${showRow ? "show-row" : ""}"><code>`
          + hljs.highlight(str, { language: lang, ignoreIllegals: true }).value.replace(/^/gm, '<span class="row-value"><span class="row-number"></span>').replace(/$/gm, '</span>')
          + '</code></pre>';

      } catch (__) { }

    }

    return '<pre class="hljs"><code>' + mdit.utils.escapeHtml(str) + '</code></pre>';

  }
});

mdit.use(katex);

export default function Markdown({  md }: { md: string }) {

  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.container}>

      <div
        ref={ref}
        dangerouslySetInnerHTML={{ __html: mdit.render(md) }}
        style={{ width: "100%" }}
      ></div>

    </div>

  );

}
