import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai from "chai";
import BN from "bn.js";

import { ERC20PresetMinterPauser, MultiCaller } from "../../typechain-types";

const expect = chai.expect;
chai.use(require("chai-bn")(BN));

let ERC20PresetMinterPauser: ERC20PresetMinterPauser;
let MultiCaller: MultiCaller;

describe("multiCaller TEST", function () {
  // test case 동작전 실행 사항들
  beforeEach(async () => {
    // deploy & init
    const [_admin, _sendManager, _user1, _user2, _user3, _user4] =
      await ethers.getSigners();

    // multicall contract
    const NEW_MultiCaller = await ethers.getContractFactory("multiCaller");
    await NEW_MultiCaller.connect(_admin).deploy();

    //test erc20 contract
    const NEW_ERC20_1 = await ethers.getContractFactory(
      "ERC20PresetMinterPauser"
    );
    const NEW_ERC20_2 = await ethers.getContractFactory(
      "ERC20PresetMinterPauser"
    );
    const NEW_ERC20_3 = await ethers.getContractFactory(
      "ERC20PresetMinterPauser"
    );
    const NEW_ERC20_4 = await ethers.getContractFactory(
      "ERC20PresetMinterPauser"
    );

    await NEW_ERC20_1.connect(_user1).deploy("TEST1", "TEST1");
    await NEW_ERC20_2.connect(_user2).deploy("TEST2", "TEST2");
    await NEW_ERC20_3.connect(_user3).deploy("TEST3", "TEST3");
    await NEW_ERC20_4.connect(_user4).deploy("TEST3", "TEST4");

    console.log("deploy success");
  });
  //
  // it("NEW_ERC20, mint to MultiCaller", async function () {
  //   const [_admin, _sendManager ,_user1, _user2, _user3, _user4] = await ethers.getSigners();
  //   await NEW_ERC20_1.connect()

  // })

  // test case
  it("_admin(deployer) to deyployed then, sendManagerSet  ", async () => {
    const [_admin, _sendManager, _user1, _user2, _user3, _user4] =
      await ethers.getSigners();
    const sendManager = await MultiCaller.sendManager();
    expect(sendManager).to.equal(_admin.address);

    await MultiCaller.connect(_admin).changeOwner(_sendManager.address);
  });

  // it("Deployment should assign the total supply of tokens to the owner", async function () {
  //   const [owner] = await ethers.getSigners();

  //   const Token = await ethers.getContractFactory("Token");

  //   const hardhatToken = await Token.deploy();

  //   const ownerBalance = await hardhatToken.balanceOf(owner.address);
  //   expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
  // });
});
