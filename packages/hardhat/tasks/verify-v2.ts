import { task } from "hardhat/config";
import axios from "axios";
import { ethers } from "ethers";

task("verify-v2", "Verifies contract with Etherscan V2 API")
  .addParam("address", "Deployed contract address")
  .addOptionalParam(
    "name",
    "Fully qualified contract name (e.g. contracts/My.sol:My)"
  )
  .addOptionalParam("chainid", "Chain ID for Etherscan v2", "1")
  .addOptionalParam(
    "constructorargs",
    "Hex-encoded constructor arguments or comma-separated values",
    ""
  )
  .setAction(async (args, hre) => {
    const { address, name, chainid, constructorargs } = args;
    const apiKey = process.env.ETHERSCAN_API_KEY;
    if (!apiKey) throw new Error("ETHERSCAN_API_KEY missing");

    await hre.run("compile");

    const artifact = await (name
      ? hre.artifacts.readArtifact(name)
      : (
          await hre.artifacts.getAllFullyQualifiedNames()
        ).map((n) => hre.artifacts.readArtifact(n))[0]);

    const buildInfo = await hre.artifacts.getBuildInfo(
      name || artifact.contractName
    );
    if (!buildInfo)
      throw new Error(
        `Build info not found for ${name || artifact.contractName}`
      );

    const { input, solcLongVersion } = buildInfo;

    // Handle constructor args
    let encodedArgs = constructorargs.trim();
    if (encodedArgs && !encodedArgs.startsWith("0x")) {
      // user passed comma-separated list, encode using ABI
      const types =
        artifact.abi
          .find((i) => i.type === "constructor")
          ?.inputs?.map((i: any) => i.type) ?? [];
      const values = encodedArgs.split(",").map((v: any) => v.trim());
      encodedArgs = ethers.AbiCoder.defaultAbiCoder().encode(types, values);
    }

    const params = new URLSearchParams({
      apikey: apiKey,
      chainid: chainid,
      module: "contract",
      action: "verifysourcecode",
      contractaddress: address,
      sourceCode: JSON.stringify(input),
      codeformat: "solidity-standard-json-input",
      contractname: name || artifact.contractName,
      compilerversion: solcLongVersion.startsWith("v")
        ? solcLongVersion
        : `v${solcLongVersion}`,
      constructorArguments: encodedArgs.replace(/^0x/, ""), // no "0x" prefix
    });

    const url = "https://api.etherscan.io/v2/api?chainid=" + chainid;

    const res = await axios.post(url, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "User-Agent": "hardhat-verify-v2/1.0",
      },
      timeout: 120_000,
    });

    console.log("Etherscan v2 response:", res.data);
  });
