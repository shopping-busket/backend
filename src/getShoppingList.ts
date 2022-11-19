import axios from 'axios';
import {promises as fsp} from 'fs';
import * as fs from 'fs';

console.log(`Checking ShoppingList file for updates.`);

const path = 'shoppinglist'
const filePath = {
  dir: 'src/shoppinglist/',
  file: 'ShoppingList.ts',
  path: () => filePath.dir + filePath.file,
}

export async function checkUpdates(): Promise<void> {
  let requestSuccess = true;
  const res = await axios.get('https://api.github.com/repos/shopping-busket/web/commits?path=%2Fsrc%2Fshoppinglist%2FShoppingList.ts&per_page=1').catch((err) => {
    requestSuccess = false;
  });
  if (!requestSuccess || !res) {
    console.log("Http req failed: couldn't fetch ShoppingList.ts")
    return;
  }

  const date = new Date(res.data[0].commit.committer.date);
  const lastUpdate = (new Date((await getOrSetLastUpdate()).lastUpdate)).getTime()

  console.log(date.getTime(), lastUpdate);

  if (date.getTime() < lastUpdate) {
    console.log('Pulling ShoppingList.ts');
    await downloadFile();
    await setLastUpdate(res.data[0].commit.committer.date);
    return;
  }

  console.log("ShoppingList.ts already up-to-date!")
}

async function setLastUpdate(lastUpdate: string): Promise<void> {
  const data = {lastUpdate};
  await fsp.mkdir(path, {recursive: true});
  await fsp.writeFile(`${path}/data.json`, JSON.stringify(data));
}

async function getOrSetLastUpdate(): Promise<{ lastUpdate: string }> {
  if (!fs.existsSync(`${path}/data.json`)) {
    console.log('no file be');
    await setLastUpdate((new Date()).toISOString());
  }

  const out = await fsp.readFile(`${path}/data.json`);
  return JSON.parse(out.toString());
}

async function downloadFile() {
  const content = await axios.get("https://raw.githubusercontent.com/shopping-busket/web/master/src/shoppinglist/ShoppingList.ts")
  await fsp.mkdir(filePath.dir, {recursive: true});
  await fsp.writeFile(filePath.path(), content.data);
}

if (require.main === module) {
  (async () => await checkUpdates())();
}
