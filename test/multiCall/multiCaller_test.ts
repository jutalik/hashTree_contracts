import {expect} from "chai"
import hre from 'hardhat'
import { isCallTrace } from "hardhat/internal/hardhat-network/stack-traces/message-trace"
import {loadFixture} from "ethereum-waffle"


import chai from 'chai';
import BN from 'bn.js';

chai.use(require('chai-bn')(BN));


describe("MultiCaller", async function () {
  const [admin, sendManager, user2, user3, user4] = await hre.ethers.getSigners()

  async function deployContracts() {
    const MultiCaller = await hre.ethers.getContractFactory("multiCaller")
    const multiCaller = await MultiCaller.connect(admin).deploy()
    await multiCaller.connect(admin).changeOwner(sendManager.address)
    
    const PER = await hre.ethers.getContractFactory("PER");
    const per = await PER.connect(user2).deploy(10000000000,"test1","test1");
    const per2 = await PER.connect(user3).deploy(10000000000,"test2","test2");
    const per3 = await PER.connect(user4).deploy(10000000000,"test3","test3");
    return {multiCaller, per, per2, per3}
  }

  it("should be able to call multiple contracts", async () => {
    const {multiCaller, per, per2, per3} = await loadFixture(deployContracts)
    // const [admin, sendManager, user2, user3, user4] = await hre.ethers.getSigners()
    
    await per.connect(user2).transferFrom(user2.address,multiCaller.address, 10000000000)
    await per2.connect(user3).transferFrom(user3.address,multiCaller.address, 10000000000)
    await per3.connect(user4).transferFrom(user4.address,multiCaller.address, 10000000000)
    
    
    const data = per.interface.encodeFunctionData("balanceOf", [multiCaller.address])
    const data2 = per2.interface.encodeFunctionData("balanceOf", [multiCaller.address])
    const data3 = per3.interface.encodeFunctionData("balanceOf", [multiCaller.address])

    expect(data).to.equal(10000000000)
    expect(data2).to.equal(10000000000)
    expect(data3).to.equal(10000000000)
    
  })
})