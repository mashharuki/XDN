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

      // batch register in chunks of 2
      const chunkSize = 2;
      for (let i = 0; i < domainData.length; i += chunkSize) {
        const chunk = domainData.slice(i, i + chunkSize);
        // console.log(`Sending batch ${Math.floor(i / chunkSize) + 1}:`, chunk);
        const tx = await domains.batchRegister(chunk);
        console.log(`Batch ${Math.floor(i / chunkSize) + 1} tx Hash:`, tx.hash);
        await tx.wait();
      }
      console.log(
        "===================================== [END] ===================================== "
      );
    } catch (e) {
      console.error("err:", e);
    }
  });
