import { ERC4907ContractType } from "../../types";

export const ERC4907Contract: ERC4907ContractType = {
  interface: `
  // SPDX-License-Identifier: MIT
  pragma solidity ^0.8.0;
  interface IERC4907 {

    /// Logged when the user of an NFT is changed or expires is changed
    /// @notice Emitted when the 'user' of an NFT or the 'expires' of the 'user' is changed
    /// The zero address for user indicates that there is no user address
    event UpdateUser(uint256 indexed tokenId, address indexed user, uint64 expires);

    /// @notice set the user and expires of an NFT
    /// @dev The zero address indicates there is no user
    /// Throws if 'tokenId' is not valid NFT
    /// @param user  The new user of the NFT
    /// @param expires  UNIX timestamp, The new user could use the NFT before expires
    function setUser(uint256 tokenId, address user, uint64 expires) external;

    /// @notice Get the user address of an NFT
    /// @dev The zero address indicates that there is no user or the user is expired
    /// @param tokenId The NFT to get the user address for
    /// @return The user address for this NFT
    function userOf(uint256 tokenId) external view returns(address);

    /// @notice Get the user expires of an NFT
    /// @dev The zero value indicates that there is no user
    /// @param tokenId The NFT to get the user expires for
    /// @return The user expires for this NFT
    function userExpires(uint256 tokenId) external view returns(uint256);
}`,
  contract: function (_contractName: string) {
    const namedContract = `// SPDX-License-Identifier: CC0-1.0
    pragma solidity ^0.8.0;
    
    import "./ERC4907.sol";
    
    contract ${_contractName} is ERC4907 {
    
        constructor(string memory name, string memory symbol)
         ERC4907(name,symbol)
         {         
         }
    
        function mint(uint256 tokenId, address to) public {
            _mint(to, tokenId);
        }
    
    } `;
    return namedContract;
  },
  ERC4907Contract: `// SPDX-License-Identifier: MIT
    pragma solidity ^0.8.0;
    
    import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
    import "./IERC4907.sol";
    
    /// You can choose the deferenct implementation of ERC721
    /// case 1: contract ERC4907 is ERC721, IERC4907
    /// case 2: contract ERC4907 is ERC721Enumerable, IERC4907
    /// case 3: contract ERC4907 is ERC721Burnable, IERC4907
    contract ERC4907 is ERC721, IERC4907 {
        struct UserInfo {
            address user; // address of user role
            uint64 expires; // unix timestamp, user expires
        }
        mapping(uint256 => UserInfo) internal _users;
    
        constructor(string memory name_, string memory symbol_)
            ERC721(name_, symbol_)
        {}
    
        /// @dev See {IERC4907-setUser}
        function setUser(
            uint256 tokenId,
            address user,
            uint64 expires
        ) public virtual override {
            require(
                _isApprovedOrOwner(msg.sender, tokenId),
                "ERC4907: transfer caller is not owner nor approved"
            );
            UserInfo storage info = _users[tokenId];
            info.user = user;
            info.expires = expires;
            emit UpdateUser(tokenId, user, expires);
        }
    
        /// @dev See {IERC4907-userOf}
        function userOf(uint256 tokenId)
            public
            view
            virtual
            override
            returns (address)
        {
            if (uint256(_users[tokenId].expires) >= block.timestamp) {
                return _users[tokenId].user;
            } else {
                return address(0);
            }
        }
    
        /// @dev See {IERC4907-userExpires}
        function userExpires(uint256 tokenId)
            public
            view
            virtual
            override
            returns (uint256)
        {
            return _users[tokenId].expires;
        }
    
        /// @dev See {IERC165-supportsInterface}
        function supportsInterface(bytes4 interfaceId)
            public
            view
            virtual
            override
            returns (bool)
        {
            return
                interfaceId == type(IERC4907).interfaceId ||
                super.supportsInterface(interfaceId);
        }
    
        /// @dev delete UserInfo when burn
        function _burn(uint256 tokenId) internal virtual override {
            delete _users[tokenId];
            emit UpdateUser(tokenId, address(0), 0);
            super._burn(tokenId);
        }
    }
    `,
};
