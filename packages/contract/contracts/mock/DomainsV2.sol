//SPDX-License-Identifier: MIT
pragma solidity >=0.8.19;

import "hardhat/console.sol";
import {StringUtils} from "./../lib/StringUtils.sol";
import {Base64} from "./../lib/Base64.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";

/**
 * Domains Cotract
 */
contract DomainsV2 is
  Initializable,
  ERC721URIStorageUpgradeable,
  OwnableUpgradeable,
  UUPSUpgradeable,
  ERC2771ContextUpgradeable
{
  // トークンID用の変数を用意する。
  uint256 private _tokenIdCounter;
  // NFT用のイメージデータ
  string private svgPartOne;
  string private svgPartTwo;
  // relayer用のアドレス
  address public relayerAddress;

  // トップレベルドメイン(TLD)
  string public tld;

  // registData
  struct RegistData {
    address to;
    string name;
    uint256 year;
  }

  // ドメインとアドレスを紐づけるmap
  mapping(string => address) public domains;
  // ENSとURL等のデータを紐づけるmap
  mapping(string => string) public records;
  // IDとドメイン名を紐づけるマmap
  mapping(uint => string) public names;
  // ドメイン所有者ごとの所有ドメインを保持するマップ
  mapping(address => string[]) public ownerDomains;
  // ドメインの有効期限を管理するマップ
  mapping(uint256 => uint256) public expirationDates;
  // ホワイトリストに含まれているかどうかを管理するマップ
  mapping(address => bool) public whitelist;

  // event
  event Register(address owner, string name);
  event SetRecord(address owner, string name, string record);
  event DomainExpired(uint256 tokenId);
  event DomainTransferred(uint256 tokenId, address newOwner);
  event Received(address indexed sender, uint256 amount);
  event FallbackReceived(address indexed sender, uint256 amount);
  event AddedToWhitelist(address indexed account);

  // カスタムエラー用の変数
  error Unauthorized();
  error AlreadyRegistered();
  error InvalidName(string name);

  // 有効期限が切れているかを確認する修飾子
  modifier onlyValidToken(uint256 tokenId) {
    require(expirationDates[tokenId] > block.timestamp, "Token expired");
    _;
  }

  // ホワイトリストに含まれているかを確認する修飾子
  modifier onlyWhitelisted() {
    require(whitelist[msg.sender], "Not in whitelist");
    _;
  }

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor(
    address _trustedForwarder
  ) ERC2771ContextUpgradeable(_trustedForwarder) initializer {
    __ERC721_init("Xenea Domain Name Service", "XDN");
    __Ownable_init(msg.sender);
    __UUPSUpgradeable_init();
  }

  /**
   * initialize function
   */
  function initialize(
    string memory _tld,
    address _relayerAddress
  ) public initializer {
    __ERC721_init("Xenea Domain Name Service", "XDN");
    __Ownable_init(msg.sender);
    __UUPSUpgradeable_init();
    // set tld & relayer address
    tld = _tld;
    relayerAddress = _relayerAddress;
    // set svg data
    // NFT用のイメージデータ
    svgPartOne = '<svg width="270" height="270" viewBox="0 0 270 270" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#a)"><path d="M0 0h270v270H0z" fill="url(#b)"/><path d="m21.364 21.455 12 19.363h.363l12-19.363h6.637L37.727 44.727 52.364 68h-6.637l-12-19h-.363l-12 19h-6.637l15-23.273-15-23.272zM74.062 68H59.7V21.454h15q6.773 0 11.59 2.796 4.82 2.773 7.387 7.977 2.568 5.182 2.568 12.41 0 7.272-2.59 12.522-2.592 5.228-7.546 8.045Q81.154 68 74.062 68m-8.727-5H73.7q5.772 0 9.568-2.227 3.795-2.228 5.66-6.341 1.863-4.114 1.863-9.796 0-5.636-1.841-9.704-1.84-4.09-5.5-6.273-3.66-2.204-9.114-2.204h-9zm77.273-41.546V68h-5.455L111.79 31.454h-.455V68h-5.636V21.454h5.454l25.455 36.637h.454V21.455z" fill="#fff"/></g><defs><linearGradient id="b" x1="0" y1="0" x2="270" y2="270" gradientUnits="userSpaceOnUse"><stop stop-color="#EEA65E"/><stop offset=".953" stop-color="#1787DE" stop-opacity=".99"/><stop offset="1" stop-color="#0CD7E4" stop-opacity=".99"/></linearGradient><clipPath id="a"><path fill="#fff" d="M0 0h270v270H0z"/></clipPath></defs><text x="32.5" y="231" font-size="27" fill="#fff" filter="url(#A)" font-family="Plus Jakarta Sans,DejaVu Sans,Noto Color Emoji,Apple Color Emoji,sans-serif" font-weight="bold">';
    svgPartTwo = "</text></svg>";
  }

  function _authorizeUpgrade(
    address newImplementation
  ) internal override onlyOwner {}

  /**
   * ドメインの長さによって価格を算出するメソッド
   * @param name ドメイン名
   * @param _years 所有期間(年単位)
   */
  function price(
    string calldata name,
    uint256 _years
  ) public pure returns (uint) {
    // ドメインの長さを算出する。
    uint len = StringUtils.strlen(name);
    // 長さによって値が変更する。
    require(len > 0);
    if (len == 3) {
      // 3文字のドメインの場合
      return (0.001 * 10 ** 18) * _years; // 0.005 MATIC = 5 000 000 000 000 000 000 (18ケタ).
    } else if (len == 4) {
      //4文字のドメインの場合
      return (0.003 * 10 ** 18) * _years; // 0.003MATIC
    } else {
      // 4文字以上
      return (0.005 * 10 ** 18) * _years; // 0.001MATIC
    }
  }

  /**
   * ドメインを発行する実処理用のメソッド
   */
  function mintDomain(RegistData calldata data) internal {
    // そのドメインがまだ登録されていないか確認します。
    if (domains[data.name] != address(0)) revert AlreadyRegistered();
    // 適切な長さであるかチェックする。
    if (!valid(data.name)) revert InvalidName(data.name);

    // ネームとTLD(トップレベルドメイン)を結合する。
    string memory _name = string(abi.encodePacked(data.name, ".", tld));
    // NFT用にSVGイメージを作成します。
    string memory finalSvg = string(
      abi.encodePacked(svgPartOne, _name, svgPartTwo)
    );
    //　現在のトークンIDを取得する。
    uint256 newRecordId = _tokenIdCounter;
    // 長さを取得する。
    uint256 length = StringUtils.strlen(data.name);
    string memory strLen = Strings.toString(length);

    // SVGのデータをBase64の形式でエンコードする。
    string memory json = Base64.encode(
      abi.encodePacked(
        '{"name": "',
        _name,
        '", "description": "A domain on the CrossValueChain Domain name service", "image": "data:image/svg+xml;base64,',
        Base64.encode(bytes(finalSvg)),
        '","length":"',
        strLen,
        '"}'
      )
    );
    // トークンURI用のデータを生成する。
    string memory finalTokenUri = string(
      abi.encodePacked("data:application/json;base64,", json)
    );

    // NFTとして発行する。
    _safeMint(data.to, newRecordId);
    // トークンURI情報を登録する。
    _setTokenURI(newRecordId, finalTokenUri);

    // 登録する。
    domains[data.name] = data.to;
    // namesにも登録する。
    names[newRecordId] = data.name;
    // 所有者のドメインリストに追加する。
    ownerDomains[data.to].push(data.name);
    // 有効期限を設定する。
    expirationDates[newRecordId] = block.timestamp + (data.year * 365 days);

    _tokenIdCounter += 1;
    emit Register(data.to, data.name);
  }

  /**
   * ドメインを登録するためのメソッド
   * @param data ドメイン登録データ
   */
  function register(RegistData calldata data) public payable {
    // ドメイン名のミントに必要な金額を算出する。
    uint _price = price(data.name, data.year);
    // 十分な残高を保有しているかどうかチェックする。
    require(msg.value >= _price, "Not enough XCR paid");

    // call mintDomain function
    mintDomain(data);

    // 金額の半分をrelayerに送金する。
    (bool success, ) = msg.sender.call{value: (msg.value / 2)}("");
    require(success, "Failed to send to relayer");
  }

  /**
   * アドレスとドメインの紐付けを更新するメソッド
   * ※ ミントではなく移動させるだけの場合のメソッド
   */
  function updateAddress(
    string calldata name,
    address _address,
    uint256 _tokenId,
    uint256 _years
  ) public {
    // 登録する。
    domains[name] = _address;
    // 有効期限を設定する。
    expirationDates[_tokenId] = block.timestamp + (_years * 365 days);
    emit Register(_address, name);
  }

  /**
   * ドメイン名をキーとしてアドレスを取得するメソッド
   * @param name ドメイン名
   */
  function getOwnerAddress(string calldata name) public view returns (address) {
    return domains[name];
  }

  /**
   * レコードを登録する
   * @param name ドメイン名
   * @param record ENSと紐づけるデータ
   */
  function setRecord(string calldata name, string calldata record) public {
    // トランザクションの送信者であることを確認しています。
    if (msg.sender != domains[name]) revert Unauthorized();
    // 登録する。
    records[name] = record;
    emit SetRecord(msg.sender, name, record);
  }

  /**
   * checkRegistered メソッド
   */
  function checkRegistered(string memory _name) public view returns (bool) {
    if (domains[_name] == address(0)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * ENSを元にデータを返すメソッド
   * @param name ドメイン名
   */
  function getRecord(string calldata name) public view returns (string memory) {
    return records[name];
  }

  /**
   * 資金を引き出すためのメソッド
   */
  function withdraw() public onlyOwner {
    // コントラクトの残高を取得する。
    uint amount = address(this).balance;
    // 呼び出し元のアドレスに送金する。
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Failed to withdraw Matic");
  }

  /**
   * 全てのドメイン名のデータを取得するメソッド
   */
  function getAllNames() public view returns (string[] memory) {
    console.log("Getting all names from contract");
    //　現在のトークンIDを取得する。
    uint256 tokenId = _tokenIdCounter;
    // ドメイン名を格納するための配列を定義する。
    string[] memory allNames = new string[](tokenId);
    // ループ文により配列を作成してドメイン情報を詰めていく。
    for (uint256 i = 0; i < tokenId; i++) {
      allNames[i] = names[i];
      console.log("Name for token %d is %s", i, allNames[i]);
    }
    // 返却する。
    return allNames;
  }

  /**
   * 所有者ごとのドメインを取得するメソッド
   */
  function getDomainsByOwner(
    address _owner
  ) public view returns (string[] memory) {
    return ownerDomains[_owner];
  }

  /**
   * 有効期限をチェックして、期限切れのドメインをburnするメソッド
   */
  function checkExpiration(uint256 tokenId) public returns (bool) {
    // 有効期限を過ぎていた場合はburnする。
    if (block.timestamp > expirationDates[tokenId]) {
      string memory expiredDomain = names[tokenId];
      // 登録データを削除する。
      delete domains[expiredDomain];
      delete names[tokenId];
      delete expirationDates[tokenId];

      emit DomainExpired(tokenId);
      return true;
    } else {
      return false;
    }
  }

  /**
   * ドメインの長さが適切かチェックするためのメソッド
   * 3文字以上10文字以下であることを確認する。
   */
  function valid(string calldata name) private pure returns (bool) {
    return StringUtils.strlen(name) >= 3 && StringUtils.strlen(name) <= 10;
  }

  /**
   * まとめてホワイトリストに登録するためのメソッド
   */
  function addToWhitelist(address[] calldata addresses) external onlyOwner {
    for (uint256 i = 0; i < addresses.length; i++) {
      whitelist[addresses[i]] = true;
      emit AddedToWhitelist(addresses[i]);
    }
  }

  /**
   * ホワイトリストに登録されているアカウントがフリーミントするためのメソッド
   */
  function freeMint(RegistData calldata data) external onlyWhitelisted {
    // NFTをミントする。
    mintDomain(data);
  }

  ///////////////////////////////// ERC2771 method /////////////////////////////////

  function _msgSender()
    internal
    view
    virtual
    override(ContextUpgradeable, ERC2771ContextUpgradeable)
    returns (address sender)
  {
    if (isTrustedForwarder(msg.sender)) {
      // The assembly code is more direct than the Solidity version using `abi.decode`.
      /// @solidity memory-safe-assembly
      assembly {
        sender := shr(96, calldataload(sub(calldatasize(), 20)))
      }
    } else {
      return super._msgSender();
    }
  }

  function _msgData()
    internal
    view
    virtual
    override(ContextUpgradeable, ERC2771ContextUpgradeable)
    returns (bytes calldata)
  {
    if (isTrustedForwarder(msg.sender)) {
      return msg.data[:msg.data.length - 20];
    } else {
      return super._msgData();
    }
  }

  receive() external payable {
    // ETHの受け取りと処理
    emit Received(msg.sender, msg.value);
  }

  fallback() external payable {
    // ETHの受け取りと処理
    emit FallbackReceived(msg.sender, msg.value);
  }

  function _contextSuffixLength()
    internal
    view
    override(ContextUpgradeable, ERC2771ContextUpgradeable)
    returns (uint256)
  {
    // Custom implementation or logic to resolve conflict
    return super._contextSuffixLength();
  }

  // ==========================================================================================
  // ======================================= V2 methods =======================================
  // ==========================================================================================

  /**
   * batch register
   * This fuction must be called by only owner
   */
  function batchRegister(RegistData[] calldata datas) public onlyOwner {
    for (uint i = 0; i < datas.length; i++) {
      // call mintDomain function
      mintDomain(datas[i]);
    }
  }
}
