import "dotenv/config";
import {task} from "hardhat/config";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import {loadDeployedContractAddresses} from "../../helper/contractsJsonHelper";
import * as fs from "fs";
import * as path from "path";
import csvParser from "csv-parser";

/**
 * CSVのデータを読み込む関数
 * @param filePath
 * @returns
 */
const readCSV = async (
  filePath: string
): Promise<{to: string; name: string; year: number}[]> => {
  return new Promise((resolve, reject) => {
    const results: {to: string; name: string; year: number}[] = [];
    let headers: string[] = [];

    fs.createReadStream(filePath)
      .pipe(csvParser({skipLines: 0}))
      .on("headers", (headerList) => {
        headers = headerList.map((h: any) => h.trim());
      })
      .on("data", (row) => {
        const to = row[headers[0]]?.trim(); // 1列目（ウォレットアドレス）
        const name = row[headers[1]]?.trim(); // 2列目（ドメイン名）
        const year = parseInt(row[headers[2]]?.trim(), 10); // 3列目（年数）

        if (!to || !name || isNaN(year)) {
          console.warn("無効なデータをスキップ:", row);
          return;
        }

        results.push({to, name, year});
      })
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
};

task("batchRegister", "batch register new domains")
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
    const domains = await hre.ethers.getContractAt("DomainsV2", Domains);

    // Get CSV File Path
    const csvFilePath = path.join(__dirname, `../../data/${taskArgs.file}`);

    try {
      // get CSV data
      const domainData = await readCSV(csvFilePath);
      if (domainData.length === 0) {
        console.error("CSVファイルが空です。");
        return;
      }

      // batch register
      const tx = await domains.batchRegister(domainData);
      console.log("tx Hash:", tx.hash);
      console.log(
        "===================================== [END] ===================================== "
      );
    } catch (e) {
      console.error("err:", e);
    }
  });
