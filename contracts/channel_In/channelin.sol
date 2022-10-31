// SPDX-License-Identifier: MIT
// write by cic cop. jojangju 

pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract ChannelIn is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    // 현재 컨트랙트의 버전
    uint public version;
    // 리워드로 건 토큰의 per로 convert되어야 하는 비율
    uint public convertRate;
    // 광고 마감일자 이후 언제까지 payment 되어야하는지 마감 일자
    uint public paymentDeadline;
    // 광고주가 동시에 몇개까지 광고를 등록 진행이 가능한지 수량
    uint8 public maxAdCount;


    struct user{
        address userAddress;
        topic[] topics;
        uint8 adCount;
    }

    struct topic{
        // 광고주
        address client;
        // 광고글에 대한 유니크 ID
        uint topicId;
        // 광고 등록 일자
        uint registrationTime;
        // 광고 마감 일자
        uint expireTime;

        // 리워드 토큰 어드레스
        address rewardsToken;
        // 리워드 토큰 밸류
        uint rewardsTokenValue;

        // 추가 리워드 토큰 어드레스(아마도 PER)
        address additionalRewardsToken;
        // 추가 리워드 토큰 밸류
        uint additionalRewardsTokenValue;
    }

    // user Address => topicId => topic
    mapping (address => topic[]) public topics;
    mapping (address => user) public users;

    // 광고주가 광고를 등록했을때 event emit
    event TopicRegistered(address indexed client, uint indexed topicId, uint indexed registrationTime, uint expireTime, address rewardsToken, uint rewardsTokenValue);
    // 광고주가 광고를 취소했을때 event emit
    event TopicCanceled(address indexed client, uint indexed topicId, uint indexed cancelTime);

    // initialize
    function initialize() public initializer {
        __Ownable_init();
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    /******** only admin Functions ********/
    function setConvertRate(uint _convertRate) public onlyOwner {
        convertRate = _convertRate;
    }
    function setPaymentDeadline(uint _paymentDeadline) public onlyOwner {
        paymentDeadline = _paymentDeadline;
    }

    // 채널IN에서 사용하는 V1용 어드민 출금 함수
    function widthdraws(address _token, address _to, uint _amount) public onlyOwner {
        IERC20(_token).transfer(_to, _amount);
    }
    /**************************************/

    
    /******** only client Functions ********/

    // 광고주가 광고를 등록하는 함수
    function registerTopic(uint _topicId, uint _expireTime, address _rewardsToken, uint _rewardsTokenValue, address _additionalRewardsToken, uint _additionalRewardsTokenValue) public returns(bool){
        // 광고주가 동시에 등록할 수 있는 광고의 수량을 초과하는지 확인
        require(users[msg.sender].adCount < maxAdCount, "You can't register more than maxAdCount");        
        // 광고주의 지갑에 광고에 대한 리워드 토큰이 있는지 확인
        require(IERC20(_rewardsToken).allowance(msg.sender, address(this))>= _rewardsTokenValue, "You don't have enough rewardsToken");
        require(IERC20(_additionalRewardsToken).allowance(msg.sender, address(this))>= _additionalRewardsTokenValue, "You don't have enough additionalRewardsToken");

        // 광고주의 지갑에서 광고에 대한 리워드 토큰을 컨트랙트로 이체
        IERC20(_rewardsToken).transferFrom(msg.sender, address(this), _rewardsTokenValue);
        IERC20(_additionalRewardsToken).transferFrom(msg.sender, address(this), _additionalRewardsTokenValue);

        // 광고주의 광고 수량을 1 증가
        users[msg.sender].adCount += 1;

        // 광고주의 광고 리스트에 광고 등록
        users[msg.sender].topics.push(topic(msg.sender, _topicId, block.timestamp, _expireTime, _rewardsToken, _rewardsTokenValue, _additionalRewardsToken, _additionalRewardsTokenValue));

        // 광고 등록 이벤트 emit
        emit TopicRegistered(msg.sender, _topicId, block.timestamp, _expireTime, _rewardsToken, _rewardsTokenValue);
        
        return true;
    }

    // 광고주가 광고를 취소하는 함수
    function cancelTopic(uint _topicId) public returns(bool){
        // 광고주의 광고 리스트에서 광고를 찾아서 삭제
        for(uint i=0; i<users[msg.sender].topics.length; i++){
            if(users[msg.sender].topics[i].topicId == _topicId){
                require(users[msg.sender].topics[i].registrationTime+1 hours >= block.timestamp, "You can't cancel topic in 1 hours");
                
                // 광고주의 광고 수량을 1 감소
                users[msg.sender].adCount -= 1;

                // 광고주에게 토큰 반환
                IERC20(users[msg.sender].topics[i].rewardsToken).transferFrom(address(this), msg.sender, users[msg.sender].topics[i].rewardsTokenValue);
                IERC20(users[msg.sender].topics[i].additionalRewardsToken).transferFrom(address(this), msg.sender, users[msg.sender].topics[i].additionalRewardsTokenValue);
                
                // 광고주의 광고 리스트에서 광고 삭제
                delete users[msg.sender].topics[i];
                emit TopicCanceled(msg.sender, _topicId, block.timestamp);
                return true;
            }
        }
        return false;
    }



    // 광고주가 리워드를 지급하는 방식 옵션
    // 1. 자유 분배. (광고주가 직접 지급(1인당 받아가는 퍼센트는 제한을 둘지 고민))
    // 2. 균등 분배. (참여한 유저들에 대해 균등하게 분배)
    // 3. 순위 분배. (순위에 대한 지급 퍼센트를 미리 정해놓고 순위에 따라 지급)
    // 4. 랜덤 분배. (랜덤으로 지급)




    /******** utils Functions ********/
    function getTopics(address _userAddress) public view returns(topic[] memory){
        return users[_userAddress].topics;
    }


    function getTopicCount(address _userAddress) public view returns(uint){
        return users[_userAddress].topics.length;
    }

    function getAdCount(address _userAddress) public view returns(uint8){
        return users[_userAddress].adCount;
    }

    function getTopicId(address _userAddress, uint _index) public view returns(uint){
        return users[_userAddress].topics[_index].topicId;
    }

}