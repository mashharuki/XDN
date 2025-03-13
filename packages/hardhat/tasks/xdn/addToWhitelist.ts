import csvParser from "csv-parser";
import "dotenv/config";
import * as fs from "fs";
import {task} from "hardhat/config";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import * as path from "path";
import {loadDeployedContractAddresses} from "../../helper/contractsJsonHelper";

/**
 * CSVのデータを読み込む関数
 * @param filePath
 * @returns
 */
const readCSV = async (filePath: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const results: string[] = [];
    let headers: string[] = [];

    fs.createReadStream(filePath)
      .pipe(csvParser({skipLines: 0}))
      .on("headers", (headerList) => {
        headers = headerList.map((h: any) => h.trim());
      })
      .on("data", (row) => {
        const to = row[headers[0]]?.trim(); // 1列目（ウォレットアドレス）

        if (!to) {
          console.warn("無効なデータをスキップ:", row);
          return;
        }

        results.push(to);
      })
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
};

task("addToWhitelist", "add To multi Whitelist addresses")
  .addParam("file", "CSV file Name")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    console.log(
      "===================================== [START] ===================================== "
    );
    // get Contract Address
    const {
      contracts: {Domains},
    } = loadDeployedContractAddresses(hre.network.name);
    // create Domains contract
    const domains = await hre.ethers.getContractAt("Domains", Domains);

    // Get CSV File Path
    const csvFilePath = path.join(__dirname, `../../data/${taskArgs.file}`);

    try {
      // get CSV data
      const whitelist = await readCSV(csvFilePath);
      if (whitelist.length === 0) {
        console.error("CSVファイルが空です。");
        return;
      }

      // batch register
      const tx = await domains.addToWhitelist(whitelist);
      console.log("tx Hash:", tx.hash);
      console.log(
        "===================================== [END] ===================================== "
      );
    } catch (e) {
      console.error("err:", e);
    }
  });
