const { glob } = require("glob");
const path = require("path");

async function deleteCachedFile(file) {
	const filePath = path.resolve(file);
	if (require.cache[filePath]) {
		delete require.cache[filePath];
	}
}

async function loadFiles(dirName) {
	try {
		const files = await glob(path.join(process.cwd(), dirName, "**/*.js").replace(/\\/g, "/"));
		const jsFiles = files.filter(file => path.extname(file) === ".js");
		await Promise.all(jsFiles.map(deleteCachedFile));
		return jsFiles;
	} catch(err) {
		console.error(`從資料夾 ${dirName} 載入檔案時發生錯誤: \n${err}`);
		throw err;
	}
}

module.exports = { loadFiles };