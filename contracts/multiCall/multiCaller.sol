// SPDX-License-Identifier: MIT
// write by cic cop. jojangju 

pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';





// hardhat test console
import "hardhat/console.sol";


contract multiCaller{
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address public dev;
    address public sendManager;


    modifier onlyDev(){
        require(msg.sender == dev);
        _;
    }
    
    modifier onlySendManager(){
        require(msg.sender == sendManager);
        _;
    }

    constructor() {
        dev = msg.sender;
        console.log('constructor dev address : ', dev);
    }


    // 채널IN 담당자 월렛을 변경하는 함수
    function changeOwner(address _newManager) external onlyDev {
        sendManager = _newManager;
        console.log('change Manager Wallet address : ', sendManager);
    }



    // 현재 컨트랙트가 토큰을 소유하고 있는지 확인
    function getTokenBalance(IERC20 token) public view returns (uint256) {
        console.log('IERC20 token address : ', address(token));
        console.log('IERC20 token address : ', token.balanceOf(address(this)));
        return token.balanceOf(address(this));
    }
    



    /*********************************** Token 전송 함수들 ***********************************/
    /* 주의 사항 */
    /* 1.EOA, CA인지 판별은 하지 않음. */
    /* 2.전송하는 토큰 종류의 ERC20 Interface는 체크하지 않음.(즉, 비정상적인 ERC20일 경우 전송이 되지 않을 수 있음) */
    /* 3.가스피 최적화를 최대한 했으나 한번에 보내는 [].length는 확인 해봐야 함 */
    



    // 단일 토큰 전송
    function WithdrawToken(IERC20 token, address to, uint256 amount) external onlySendManager {
        // console.log('WithdrawToken : ', to, amount);
        token.safeTransfer(to, amount);
    }

    // 다중 토큰 전송 funcions //
    // 1.한 종류의 토큰을 여러 유저에게 고정 밸류로 전송 (에어드랍, 이벤트 용도로 사용 가능)
    function multiSendFixedToken(IERC20 token, address[] memory recipients, uint256 amount) external onlySendManager {
        
        address from = address(this);
        console.log(from);
        require(recipients.length > 0);
        require(amount > 0);
        require(recipients.length * amount <= token.balanceOf(address(this)));
        for (uint256 i = 0; i < recipients.length; i++) {
            token.safeTransfer(recipients[i], amount);
            // console.log(this.getTokenBalance(token));
            // console.log(i, recipients[i], amount);
        }
        
    }  
    
    // 2.한 종류의 토큰을 여러 유저에게 여러 밸류로 전송 (V2로 넘어갈때 포인트 정산개념으로 사용시 사용 가능)
    function multiSendDiffToken(IERC20 token, address[] memory recipients, uint256[] memory amounts) external onlySendManager {
        
        require(recipients.length > 0);
        require(recipients.length == amounts.length);
        
        address from = address(this);
        
        uint256 thisBalance = token.balanceOf(from);
        uint256 currentSum = 0;
        
        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 amount = amounts[i];
            
            require(amount > 0);
            currentSum = currentSum.add(amount);
            require(currentSum <= thisBalance);
            
            token.safeTransfer(recipients[i], amount);
        }
    }   

}