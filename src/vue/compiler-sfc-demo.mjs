import pkg from 'fs-extra';
const { readFile, writeFile } = pkg;
import { parse, compileScript, compileTemplate, rewriteDefault } from "@vue/compiler-sfc";

import { build } from "esbuild";
import externalGlobalPluginPkg from 'esbuild-plugin-external-global';
const { externalGlobalPlugin } = externalGlobalPluginPkg;

async function main() {
    const file = await readFile('./main.vue', 'utf8');
    const { descriptor, error } = parse(file);

    const id = Date.now().toString();
    const scopeId = `data-v-${id}`;

    const script = compileScript(descriptor, { id: scopeId });
    const codeList = [];
    codeList.push(rewriteDefault(script.content, "__sfc_main__"));
    codeList.push(`__sfc_main__.__scopeId='${scopeId}'`);

    const template = compileTemplate({
        source: descriptor.template?.content,
        filename: "main.vue", // 用于错误提示
        id: scopeId,
    });
    codeList.push(template.code);
    codeList.push(`__sfc_main__.render=render`);
    codeList.push(`export default __sfc_main__`);

    const code = codeList.join("\n");
    await writeFile("build.temp.js", code);

    await build({
        entryPoints: ["build.temp.js"],	// 入口文件
        format: "esm",			// 打包成 esm
        outfile: "bundle.js",		// 设置打包文件的名字
        bundle: true,				// bundle 为 true 才是打包模式
        external: ["vue"],
        plugins: [
          externalGlobalPlugin({
            vue: "window.Vue",	// 将 import vue 模块，替换成 window.Vue
          }),
        ],
      });
}
main();
