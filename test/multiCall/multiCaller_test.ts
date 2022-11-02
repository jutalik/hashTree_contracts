import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { PER, MultiCaller } from "../../typechain-types/";
// import { isCallTrace } from "hardhat/internal/hardhat-network/stack-traces/message-trace";
// import { loadFixture } from "ethereum-waffle";

// import chai from "chai";
// import BN from "bn.js";

// chai.use(require("chai-bn")(BN));

describe("multiCaller", async function () {
  /* 테스트 전 초기 셋팅해야 할 것들*/
  /* 1.account              */
  /* 2.contract Deploy      */
  /* 3.etc                  */
  /**************************/

  // 전역적으로 쓸 accounts 선언

  // EOA(유저 account)
  let admin: SignerWithAddress;
  let sendManager: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;
  let user4: SignerWithAddress;
  let nomalUser: SignerWithAddress;
  let nomalUser2: SignerWithAddress;
  let nomalUser3: SignerWithAddress;
  let nomalUser4: SignerWithAddress;

  // CA(contract account)
  let multiCaller: MultiCaller;
  let per: PER;
  let per2: PER;
  let per3: PER;
  let per4: PER;

  // getSigners를 통해 사용할 월렛들 할당
  const setAccounts = async () => {
    await ethers.getSigners().then((signers) => {
      admin = signers[0];
      sendManager = signers[1];
      user1 = signers[2];
      user2 = signers[3];
      user3 = signers[4];
      user4 = signers[5];
      nomalUser = signers[6];
      nomalUser2 = signers[7];
      nomalUser3 = signers[8];
      nomalUser4 = signers[9];
    });
  };

  // 컴파일한 컨트랙트들을 배포하고 초기 셋팅값 셋팅
  const deployContracts = async () => {
    await setAccounts();
    const MultiCaller = await hre.ethers.getContractFactory("multiCaller");
    const PER = await hre.ethers.getContractFactory("PER");

    multiCaller = (await MultiCaller.connect(admin).deploy()) as MultiCaller;
    await multiCaller.connect(admin).changeOwner(sendManager.address);

    per = (await PER.connect(user1).deploy(
      ethers.utils.parseUnits("1000", 18),
      "test1",
      "test1"
    )) as PER;

    per2 = (await PER.connect(user2).deploy(
      10000000000,
      "test2",
      "test2"
    )) as PER;

    per3 = (await PER.connect(user3).deploy(
      ethers.utils.parseUnits("1000", 18),
      "test3",
      "test3"
    )) as PER;

    per4 = (await PER.connect(user4).deploy(
      ethers.utils.parseUnits("1000", 18),
      "test4",
      "test4"
    )) as PER;
  };

  // 여기까지 테스트를 필요한 초기 initialize셋팅 완료//
  /******************************************/

  /* 테스트 Case 작성          */
  /**************************/

  it("step1. multiCaller(CA) to Tokens Transfer : ", async function () {
    await deployContracts();
    await per
      .connect(user1)
      .transfer(multiCaller.address, ethers.utils.parseUnits("1000", 18));
    await per2
      .connect(user2)
      .transfer(multiCaller.address, ethers.utils.parseUnits("1000", 18));
    await per3
      .connect(user3)
      .transfer(multiCaller.address, ethers.utils.parseUnits("1000", 18));
    await per4
      .connect(user4)
      .transfer(multiCaller.address, ethers.utils.parseUnits("1000", 18));

    expect(await per.balanceOf(multiCaller.address)).to.equal(
      ethers.utils.parseUnits("1000", 18)
    );
    expect(await per2.balanceOf(multiCaller.address)).to.equal(
      ethers.utils.parseUnits("1000", 18)
    );
    expect(await per3.balanceOf(multiCaller.address)).to.equal(
      ethers.utils.parseUnits("1000", 18)
    );
    expect(await per4.balanceOf(multiCaller.address)).to.equal(
      ethers.utils.parseUnits("1000", 18)
    );
  });

  it("step2. multiCaller's function test : ", async function () {
    await multiCaller.getTokenBalance(per.address);
    await multiCaller.getTokenBalance(per2.address);
    await multiCaller.getTokenBalance(per3.address);
    await multiCaller.getTokenBalance(per4.address);

    await multiCaller
      .connect(sendManager)
      .WithdrawToken(
        per.address,
        user1.address,
        ethers.utils.parseUnits("1", 18)
      );

    await multiCaller
      .connect(sendManager)
      .multiSendFixedToken(
        per.address,
        [user1.address, user2.address, user3.address, user4.address],
        ethers.utils.parseUnits("1", 18)
      );

    // expect()
    await multiCaller.getTokenBalance(per.address);

    await multiCaller
      .connect(sendManager)
      .multiSendDiffToken(
        per2.address,
        [nomalUser.address, nomalUser2.address, nomalUser3.address],
        [
          ethers.utils.parseUnits("1", 18),
          ethers.utils.parseUnits("2", 18),
          ethers.utils.parseUnits("3", 18),
        ]
      );

    await multiCaller.getTokenBalance(per2.address);
  });
});
