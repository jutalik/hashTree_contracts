pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract multiCaller{
    function multiCall(address[] memory _targets, bytes[] memory _data) public payable returns (bytes[] memory results) {
        results = new bytes[](_targets.length);
        for (uint256 i = 0; i < _targets.length; i++) {
            (bool success, bytes memory result) = _targets[i].call{value: msg.value}(_data[i]);
            require(success, "multiCall: transaction failed");
            results[i] = result;
        }
    }

    // approve, 몇가지 require문 추가해야함 channel IN에서 
    // 관리자의 입금시 계산을 도와주는 calculrate 함수 추가할지는 고민 해보고..
    // 조금 더 가스피를 절약할 수 있는 방법도 고안해봐야 할듯.
    function sendTokens(address _targetToken1, address _targetToken2, address _from, address _to, uint _value) public {
        IERC20(_targetToken1).transferFrom(_from, _to, _value);
        IERC20(_targetToken2).transferFrom(_from, _to, _value);
    }
}