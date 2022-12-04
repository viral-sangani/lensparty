<div align="center">
    <h1>LensParty</h1>
    <strong>Permissionless social media app 🌿</strong>
</div>
<br>
<div align="center">
    <br>
    <a href="https://lensparty.xyz"><b>lensparty.xyz »</b></a>
    <br><br>
</div>

## About LensParty

LensParty is a permissionless social media app built with [Lens Protocol](http://lens.xyz) with support of Community Profiles!

## Setup

### Using Local Environment

```sh
yarn install
yarn dev
```

### Technologies Used

#### Lens Protocol

LensParty uses Lens Protocol as the base layer for all social media interactions, Lens Protocol supports User Profile we did a trick in attributes to support Community Profiles.

#### Covalent

LensParty uses Covalent to check the NFT balances of a user requesting to participate in a community profile interaction.

#### Revise

LensParty uses Revise Dynamic NFTs to give community followers a Dynamic NFT. The Dynamic NFT basically shows the count of posts done by the community profile.

In future, we can also store reputation of the community.

Lens Protocol Follow NFT - 0x632b82897D1b2Ef3E16041Aff44FC81B32BA124D

#### Push Protocol

Currently Lens Protocol only supports notifications for interactions on the logged in profile.

LensParty uses Push Protocol to send notification to people who follow the community.

### Create Community

![create-community-flow](https://user-images.githubusercontent.com/38040789/205459166-0b8b831f-2d95-4f6b-b65f-58935765045d.png)

Users create community via the backend by passing the `accessToken` in order to prove address ownership.

User also sends conditions required in order to post on the community.

Backend creates a community using Lens Protocol and the `followNFTURI` is a Dynamic NFT by Revise.

### Create Post on Community

![create-post-on-community](https://user-images.githubusercontent.com/38040789/205459264-581d345b-2d2f-455a-8560-dfbcc9651990.png)

Users can create posts on Community profiles via the backend.

Users proves address ownership by passing the `accessToken` to the backend.

Backend uses Covalent API to check if the user satisfies the `nftCondition`.

If yes, server creates the requested post on the community, update the Revise Dynamic NFT and send notification via Push to all users are following the community profile on Lens.

### Change Community Metadata

![change-community-metadata](https://user-images.githubusercontent.com/38040789/205459372-47d92042-9bcb-4479-ba19-43ee1dd7ff71.png)

User can also change metadata of the community they created.

## ⚖️ License

Lenster is open-sourced software licensed under the © [MIT](LICENSE).
