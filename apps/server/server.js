const express = require('express');
const dotenv = require('dotenv').config();
const axios = require('axios');
const { Wallet, providers, ethers } = require('ethers');
const fs = require('fs');
const Moralis = require('moralis').default;
const { v4 } = require('uuid');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const PushAPI = require('@pushprotocol/restapi');
const bodyParser = require('body-parser');
const { Revise } = require('revise-sdk');

const API_URL = 'https://api-mumbai.lens.dev';
const PORT = 3001;
const RPC_URL = 'https://rpc-mumbai.maticvigil.com/';
let wallet;

const ethersProvider = new providers.JsonRpcProvider(RPC_URL);

const challenge = `
    query Challenge($address: EthereumAddress!) {
        challenge(request: { address: $address }) {
            text
        }
    }
`;

const verify = `
    query Query ($request: VerifyRequest!) {
        verify(request: $request)
    }
`;

const authenticate = `
    mutation Authenticate($address: EthereumAddress!, $signature: Signature!) {
        authenticate(request: { address: $address, signature: $signature }) {
            accessToken
            refreshToken
        }
    }
`;

const createProfile = `
    mutation createProfile($request: CreateProfileRequest!) {
        createProfile(request: $request) {
            ... on RelayerResult {
                txHash
            }
            ... on RelayError {
                reason
            }
            __typename
        }
    }
`;

const transactionIndexed = `query HasTxHashBeenIndexed ($request: HasTxHashBeenIndexedRequest!) {
    hasTxHashBeenIndexed(request: $request) {
      ... on TransactionIndexedResult {
        indexed
        txReceipt {
          to
          from
          contractAddress
          transactionIndex
          root
          gasUsed
          logsBloom
          blockHash
          transactionHash
          blockNumber
          confirmations
          cumulativeGasUsed
          effectiveGasPrice
          byzantium
          type
          status
          logs {
            blockNumber
            blockHash
            transactionIndex
            removed
            address
            data
            topics
            transactionHash
            logIndex
          }
        }
        metadataStatus {
          status
          reason
        }
      }
      ... on TransactionError {
        reason
        txReceipt {
          to
          from
          contractAddress
          transactionIndex
          root
          gasUsed
          logsBloom
          blockHash
          transactionHash
          blockNumber
          confirmations
          cumulativeGasUsed
          effectiveGasPrice
          byzantium
          type
          status
          logs {
            blockNumber
            blockHash
            transactionIndex
            removed
            address
            data
            topics
            transactionHash
            logIndex
          }
        }
      },
      __typename
    }
  }`;

const refresh = `
mutation Refresh ($request: RefreshRequest!) {
    refresh(request: $request) {
      accessToken
      refreshToken
    }
  }
`;

const setProfileMetadata = `
mutation CreateSetProfileMetadataTypedData ($request: CreatePublicSetProfileMetadataURIRequest!) {
    createSetProfileMetadataTypedData(request: $request) {
      id
        expiresAt
        typedData {
          types {
            SetProfileMetadataURIWithSig {
              name
              type
            }
          }
          domain {
            name
            chainId
            version
            verifyingContract
          }
          value {
            nonce
            deadline
            profileId
            metadata
          }
        }
    }
  }
`;

const broadcast = `
mutation Broadcast($request: BroadcastRequest!) {
    broadcast(request: $request) {
        ... on RelayerResult {
            txHash
    txId
        }
        ... on RelayError {
            reason
        }
    }
}
`;

const getProfile = `
query Profile ($request: SingleProfileQueryRequest!) {
    profile(request: $request) {
      id
      name
      bio
      attributes {
        displayType
        traitType
        key
        value
      }
      followNftAddress
      metadata
      isDefault
      picture {
        ... on NftImage {
          contractAddress
          tokenId
          uri
          verified
        }
        ... on MediaSet {
          original {
            url
            mimeType
          }
        }
        __typename
      }
      handle
      coverPicture {
        ... on NftImage {
          contractAddress
          tokenId
          uri
          verified
        }
        ... on MediaSet {
          original {
            url
            mimeType
          }
        }
        __typename
      }
      ownedBy
      dispatcher {
        address
        canUseRelay
      }
      stats {
        totalFollowers
        totalFollowing
        totalPosts
        totalComments
        totalMirrors
        totalPublications
        totalCollects
      }
      followModule {
        ... on FeeFollowModuleSettings {
          type
          amount {
            asset {
              symbol
              name
              decimals
              address
            }
            value
          }
          recipient
        }
        ... on ProfileFollowModuleSettings {
          type
        }
        ... on RevertFollowModuleSettings {
          type
        }
      }
    }
  }
`;

const createPostTypedData = `
mutation CreatePostTypedData ($request: CreatePublicPostRequest!) {
    createPostTypedData(request: $request) {
      id
      expiresAt
      typedData {
        types {
          PostWithSig {
            name
            type
          }
        }
        domain {
          name
          chainId
          version
          verifyingContract
        }
        value {
          nonce
          deadline
          profileId
          contentURI
          collectModule
          collectModuleInitData
          referenceModule
          referenceModuleInitData
        }
      }
    }
  }
`;

const validateMetadata = `
query ValidatePublicationMetadata ($request: ValidatePublicationMetadataRequest!) {
    validatePublicationMetadata(request: $request) {
      valid
      reason
    }
  }
`;

const isFollowing = `
query Profile($request: SingleProfileQueryRequest!, $profileId: ProfileId!) {
    profile(request: $request) {
      isFollowing($profileId)
    }
  }
  
  `;

const followers = `

query Followers ($request: FollowersRequest!) {
    followers(request: $request) {
        items {
            wallet {
                address
            }
        }
    }
  }
`;

function requiresToken(req, res, next) {
  let { lensToken } = req.body;
  if (lensToken) {
    let decoded = jwt.decode(lensToken);
    console.log(decoded);
    res.locals.jwtDecoded = {
      address: decoded.id,
      expired: decoded.exp < Date.now() / 1000
    };
    next();
  } else {
    res.status(200).json({
      data: {
        errorMessage: 'No lensToken provided'
      }
    });
  }
}

function parseTokens() {
  let accessToken, refreshToken;
  try {
    let readOutput = fs.readFileSync('access_tokens.json', {
      encoding: 'utf-8'
    });
    let parsedData = JSON.parse(readOutput);
    accessToken = parsedData.accessToken;
    refreshToken = parsedData.refreshToken;
  } catch (err) {
    console.log(err.message);
  }
  return { accessToken, refreshToken };
}

const hasTxBeenIndexed = async (accessToken, txHash) => {
  let transactionIndexedResponse = await axios({
    url: API_URL,
    method: 'post',
    data: {
      query: transactionIndexed,
      variables: {
        request: {
          txHash
        }
      }
    },
    headers: {
      'x-access-token': `Bearer ${accessToken}`
    }
  });

  const result = transactionIndexedResponse.data;
  return result.data.hasTxHashBeenIndexed;
};

const pollUntilIndexed = async (accessToken, input) => {
  while (true) {
    const response = await hasTxBeenIndexed(accessToken, input);
    console.log('pool until indexed: result', response);

    if (response.__typename === 'TransactionIndexedResult') {
      console.log('pool until indexed: indexed', response.indexed);
      console.log('pool until metadataStatus: metadataStatus', response.metadataStatus);

      console.log(response.metadataStatus);
      if (response.metadataStatus) {
        if (response.metadataStatus.status === 'SUCCESS') {
          return response;
        }

        if (response.metadataStatus.status === 'METADATA_VALIDATION_FAILED') {
          throw new Error(response.metadataStatus.status);
        }
      } else {
        if (response.indexed) {
          return response;
        }
      }

      console.log('pool until indexed: sleep for 1500 milliseconds then try again');
      // sleep for a second before trying again
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } else {
      // it got reverted and failed!
      throw new Error(response.reason);
    }
  }
};

async function authenticateMiddleWare(req, res, next) {
  wallet = new Wallet(process.env.PRIVATE_KEY, ethersProvider);

  let { accessToken, refreshToken } = parseTokens();

  if (accessToken) {
    // access token does exist

    // check if accessToken is valid
    let isAccessTokenValid = await verifyAccessToken(accessToken);
    if (isAccessTokenValid) {
      // not expired
    } else {
      // expired

      // try refreshing access token
      let tokens = await refreshAccessToken(refreshToken);

      // write new access token to file.
      writeAccessTokensToFile(tokens);
    }
  } else {
    // access token does not exist
    // request challenge
    let challengeText = await generateChallenge(wallet.address);

    // sign challenge using wallet
    let signature = await wallet.signMessage(challengeText);

    // send signature for authentication
    let tokens = await authenticateSignedMessage(wallet.address, signature);
    console.log(tokens);
    // on success write down the access_token and refresh_token in the file.
    writeAccessTokensToFile(tokens);

    // return those access tokens.
  }

  next();
}

async function generateChallenge(address) {
  let challengeResponse = await axios({
    url: API_URL,
    method: 'post',
    data: {
      query: challenge,
      variables: {
        address
      }
    }
  });

  return challengeResponse.data.data.challenge.text;
}

async function authenticateSignedMessage(address, signature) {
  let authenticateResponse = await axios({
    url: API_URL,
    method: 'post',
    data: {
      query: authenticate,
      variables: {
        address: address,
        signature
      }
    }
  });

  return authenticateResponse.data.data.authenticate;
}

async function refreshAccessToken(refreshToken) {
  let refreshResponse = await axios({
    url: API_URL,
    method: 'post',
    data: {
      query: refresh,
      variables: {
        request: {
          refreshToken
        }
      }
    }
  });

  console.log(refreshResponse.data.data.refresh);

  return refreshResponse.data.data.refresh;
}

function writeAccessTokensToFile(tokensObj) {
  fs.writeFileSync('access_tokens.json', JSON.stringify(tokensObj));
}

async function verifyAccessToken(accessToken) {
  let verifyResponse = await axios({
    url: API_URL,
    method: 'post',
    data: {
      query: verify,
      variables: {
        request: {
          accessToken
        }
      }
    }
  });

  return verifyResponse.data.data.verify;
}

async function uploadToIpfs(name, content) {
  const uploadArray = [
    {
      path: name,
      // content: {
      //     name: "stani",
      //     bio: "test stani",
      //     cover_picture: null,
      //     attributes: [
      //         {
      //             traitType: "string",
      //             key: "profileType",
      //             value: "community",
      //         },
      //         {
      //             traitType: "number",
      //             key: "0x9A534628B4062E123cE7Ee2222ec20B86e16Ca8F",
      //             value: 1,
      //         },
      //     ],
      //     version: "1.0.0",
      //     metadata_id: 0.14197644684234436,
      //     appId: "lenssomething",
      // },
      content
    }
  ];

  const moralisRes = await Moralis.EvmApi.ipfs.uploadFolder({
    abi: uploadArray
  });

  return moralisRes.result[0].path;
}

async function signMessage(message) {
  // let response =
  //     setMetadataResponse.data.data.createSetProfileMetadataTypedData;

  let typedData = message.typedData;

  let signature = await wallet._signTypedData(typedData.domain, typedData.types, typedData.value);

  return signature;
}

async function broadcastTransaction(access_token, id, signature) {
  let broadcastResponse = await axios({
    url: API_URL,
    method: 'post',
    data: {
      query: broadcast,
      variables: {
        request: {
          id,
          signature
        }
      }
    },
    headers: {
      'x-access-token': `Bearer ${access_token}`
    }
  });

  return broadcastResponse.data.data.broadcast;
}

async function getProfileUsingProfileId(profileId) {
  let getProfileResponse = await axios({
    url: API_URL,
    method: 'post',
    data: {
      query: getProfile,
      variables: {
        request: {
          profileId
        }
      }
    }
  });

  return getProfileResponse.data.data.profile;
}

async function getProfileUsingHandle(handle) {
  let getProfileResponse = await axios({
    url: API_URL,
    method: 'post',
    data: {
      query: getProfile,
      variables: {
        request: {
          handle
        }
      }
    }
  });

  return getProfileResponse.data.data.profile;
}

async function getProfileAttributes(profileId) {
  let profile = await getProfileUsingProfileId(profileId);
  return profile.attributes;
}

async function getProfileAttribute(profileId, attributeKey) {
  let attributes = await getProfileAttributes(profileId);
  return attributes.filter((attribute) => attribute.key === attributeKey);
}

async function getProfileFollowers(profileId) {
  let followersResponse = await axios({
    url: API_URL,
    method: 'post',
    data: {
      query: followers,
      variables: {
        request: {
          profileId,
          limit: 50
        }
      }
    }
  });

  return followersResponse.data.data.followers;
}

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/createprofile', authenticateMiddleWare, requiresToken, async (req, res, next) => {
  let { accessToken } = parseTokens();

  let { followModule, handle, profilePictureUri, bio, tags, nftCollection } = req.body;

  let { address } = res.locals.jwtDecoded;

  const revise = new Revise({
    auth: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmMWZjMTcwLTllZWQtNDU4OC05MzUwLWM0M2VlOGU4NmU0OSIsImtleSI6ImUyczMyNzh4IiwiaWF0IjoxNjcwMDU5NDI0fQ.r5_qRwXyvizqQDEnVNmB4997LtJ7ccf3v3UH2zIBG-o'
  });

  let buffer = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="300" height="300" viewBox="0 0 1080 1080" xml:space="preserve"><desc>Created with Fabric.js 5.2.4</desc><defs></defs><g transform="matrix(1 0 0 1 540 540)" id="39f5007a-21e8-4579-9e06-ce979cc0e7fc"><rect style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1; visibility: hidden;" vector-effect="non-scaling-stroke" x="-540" y="-540" rx="0" ry="0" width="1080" height="1080"/></g><g transform="matrix(1 0 0 1 540 540)" id="b2eacb88-a819-474f-bc04-3fe88228955e"></g><g transform="matrix(1 0 0 1 540 835.7)" style="" id="41414c05-bea9-4bbb-b05a-6631c150ac8a"><text xml:space="preserve" font-family="Alegreya" font-size="80" font-style="normal" font-weight="700" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1; white-space: pre;"><tspan x="-88.24" y="25.13">Posts</tspan></text></g><g transform="matrix(1 0 0 1 540 462.78)" style="" id="e145f7c9-db59-40da-8538-af404c48ccd5"><text xml:space="preserve" font-family="Raleway" font-size="200" font-style="normal" font-weight="900" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1; white-space: pre;"><tspan x="-61.4" y="62.83">0</tspan></text></g></svg>`
  );

  let base64 = buffer.toString('base64');

  let imageSvg = await uploadToIpfs(`${v4()}.json`, `data:image/svg+xml;base64,${base64}`);

  // revise dynamic nft
  const newNFT = await revise.addNFT(
    {
      name: `${handle}'s follow nft`,
      image: `https://lensparty-production.up.railway.app/svg/0`,
      tokenId: v4()
    },
    [{ posts: 0 }]
  );

  let profileRequest = {
    handle,
    profilePictureUri,
    followNFTURI: `https://revise.link/${newNFT.createdNftId}`,
    followModule:
      followModule !== null
        ? followModule
        : {
            freeFollowModule: true
          }
  };

  console.log(profileRequest);

  try {
    let createProfileResponse = await axios({
      url: API_URL,
      method: 'post',
      data: {
        query: createProfile,
        variables: {
          request: profileRequest
        }
      },
      headers: {
        'x-access-token': `Bearer ${accessToken}`
      }
    });

    let { reason } = createProfileResponse.data.data.createProfile;

    if (!reason) {
      let { txHash } = createProfileResponse.data.data.createProfile;
      await pollUntilIndexed(accessToken, txHash);

      let profile = await getProfileUsingHandle(`${handle}.test`);

      let { id } = profile;

      let metadata = await uploadToIpfs(`${handle}_metadata.json`, {
        version: '1.0.0',
        metadata_id: v4(),
        name: handle,
        bio: bio !== undefined ? bio : null,
        cover_picture: null,
        attributes: [
          tags !== null
            ? {
                traitType: 'string',
                key: 'tags',
                value: tags
              }
            : {
                traitType: 'string',
                key: 'tags',
                value: ''
              },
          {
            traitType: 'string',
            key: 'profileType',
            value: 'community'
          },
          {
            traitType: 'string',
            key: 'profileCreator',
            value: address
          },
          {
            traitType: 'string',
            key: 'followNFTId',
            value: newNFT.createdNftId
          },
          nftCollection !== null
            ? {
                displayType: 'string',
                traitType: 'nft',
                key: 'nftCollection',
                value: nftCollection
              }
            : {
                displayType: 'string',
                traitType: 'nft',
                key: 'nftCollection',
                value: ''
              }
        ]
      });

      let setProfileMetadataResponse = await axios({
        url: API_URL,
        method: 'post',
        data: {
          query: setProfileMetadata,
          variables: {
            request: {
              profileId: id,
              metadata
            }
          }
        },
        headers: {
          'x-access-token': `Bearer ${accessToken}`
        }
      });

      let txid = setProfileMetadataResponse.data.data.createSetProfileMetadataTypedData.id;
      let signature = await signMessage(
        setProfileMetadataResponse.data.data.createSetProfileMetadataTypedData
      );

      let broadcastResponse = await broadcastTransaction(accessToken, txid, signature);

      res.status(200).json({
        data: broadcastResponse,
        handle
      });
    } else {
      res.status(200).json({
        data: { reason }
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err });
  }
});

app.post('/setProfileMetadata', authenticateMiddleWare, requiresToken, async (req, res, next) => {
  let { profileId, metadata } = req.body;
  let { name, bio, cover_picture, attributes: inputAttributes, version, appId } = metadata;
  let { accessToken } = parseTokens();

  let { address } = res.locals.jwtDecoded;

  let attributes = await getProfileAttribute(profileId, 'profileCreator');
  let profile = await getProfileUsingProfileId(profileId);

  if (attributes[0].value === address) {
    let metadata = await uploadToIpfs(`${profileId}.json`, {
      name,
      bio,
      cover_picture: cover_picture !== null ? cover_picture : null,
      attributes: [...inputAttributes, ...profile.attributes],
      version,
      metadata_id: v4(),
      appId
    });

    let setMetadataResponse = await axios({
      url: API_URL,
      method: 'post',
      data: {
        query: setProfileMetadata,
        variables: {
          request: {
            profileId,
            metadata
          }
        }
      },
      headers: {
        'x-access-token': `Bearer ${accessToken}`
      }
    });

    let signature = await signMessage(setMetadataResponse.data.data.createSetProfileMetadataTypedData);

    let broadcastResponse = await broadcastTransaction(
      accessToken,
      setMetadataResponse.data.data.createSetProfileMetadataTypedData.id,
      signature
    );

    res.status(200).json({
      data: broadcastResponse
    });
  } else {
    res.status(200).json({
      data: {
        error: {
          message: 'User not owner of profile'
        }
      }
    });
  }
});

app.post('/coverPicture', authenticateMiddleWare, async (req, res, next) => {
  let { profileId, cover_picture } = req.body;
  let { accessToken } = await parseTokens();

  let profile = await getProfileUsingProfileId(profileId);

  let { metadata: metadataUrl } = profile;

  let { data: metadata } = await axios.get(metadataUrl, {
    headers: {
      'Accept-Encoding': 'application/json'
    }
  });

  console.log(metadata);

  console.log({ ...metadata, cover_picture });
  let finalMetadata = await uploadToIpfs(`${v4()}.json`, { ...metadata, cover_picture });

  let setMetadataResponse = await axios({
    url: API_URL,
    method: 'post',
    data: {
      query: setProfileMetadata,
      variables: {
        request: {
          profileId,
          metadata: finalMetadata
        }
      }
    },
    headers: {
      'x-access-token': `Bearer ${accessToken}`
    }
  });

  let signature = await signMessage(setMetadataResponse.data.data.createSetProfileMetadataTypedData);

  let broadcastResponse = await broadcastTransaction(
    accessToken,
    setMetadataResponse.data.data.createSetProfileMetadataTypedData.id,
    signature
  );

  res.status(200).json({
    data: broadcastResponse
  });
});

app.post('/createpost', authenticateMiddleWare, requiresToken, async (req, res, next) => {
  let { profileId, posterProfileId, collectModule, contentURI } = req.body;
  let { address } = res.locals.jwtDecoded;
  let { accessToken } = parseTokens();

  // create post
  // get community profile from profileId or handle

  let profile = await getProfileUsingProfileId(profileId);
  let posterProfile = await getProfileUsingProfileId(posterProfileId);

  // get conditions to post
  let conditions = profile.attributes.filter((attribute) => attribute.traitType == 'nft');
  let reviseNFTId = profile.attributes.filter((attribute) => attribute.key == 'followNFTId');

  let walletSatisfiesConditions = false;

  if (conditions.length) {
    let nftContractAddress = conditions[0].value;

    // check if wallet meets the conditions to post

    if (nftContractAddress.length) {
      let covalentResponse = await axios.get(
        `https://api.covalenthq.com/v1/80001/address/${address}/balances_v2/?quote-currency=USD&format=JSON&nft=true&no-nft-fetch=false&key=ckey_95affad333ef43c4b70eb7a8278`,
        {
          headers: {
            'Accept-Encoding': 'application/json'
          }
        }
      );

      let { items } = covalentResponse.data.data;

      let conditionsMatch = items.filter((item) => {
        return item.contract_address === nftContractAddress;
      });

      if (conditionsMatch.length > 0) {
        walletSatisfiesConditions = true;
      }
    } else {
      walletSatisfiesConditions = true;
    }
  } else {
    walletSatisfiesConditions = true;
  }

  if (walletSatisfiesConditions) {
    // post
    // let contentMetadata = {
    //   version: '2.0.0',
    //   metadata_id: v4(),
    //   description: '',
    //   content:
    //     'about optimizations on LensTube, how well the videos load for you? Vote below and share more ideas to make LensTube more epic ✨🙏\n\n1 = fast\n2 = not fast enough',
    //   locale: 'en-US',
    //   // tags: ,
    //   // contentWarning:
    //   mainContentFocus: 'TEXT_ONLY',
    //   name: 'Comment by @youmemeworld.lens',
    //   // add an extra attribute of postedBy to know who posted on which community.
    //   attributes: [
    //     // ...argsAttributes,
    //     {
    //       displayType: 'string',
    //       traitType: 'type',
    //       value: 'text_only'
    //     },
    //     {
    //       displayType: 'string',
    //       traitType: 'postedBy',
    //       value: address
    //     },
    //     {
    //       displayType: 'string',
    //       traitType: 'postedByHandle',
    //       value: posterProfile.handle
    //     },
    //     {
    //       displayType: 'string',
    //       traitType: 'postedByProfileId',
    //       value: posterProfile.id
    //     }
    //   ],
    //   image: 'ipfs://bafkreih5usbykwf7eunzehikrmgy4oidv4w67cb7coyc2hhzlsgou3ur34',
    //   // media: [
    //   //     {
    //   //         item: "ipfs://bafybeihl6tle6ykrostimuemogf7ei2sprugp6qdsfrmdyq3hcunasd4qi",
    //   //     },

    //   // ],
    //   appId: 'lensparty'
    // };

    // let contentURI = await uploadToIpfs(`post_by_@${posterProfile.handle}`, contentMetadata);

    let createPostTypedDataResponse = await axios({
      url: API_URL,
      method: 'post',
      data: {
        query: createPostTypedData,
        variables: {
          request: {
            profileId: profile.id,
            contentURI,
            collectModule:
              collectModule !== undefined
                ? collectModule
                : {
                    freeCollectModule: {
                      followerOnly: false
                    }
                  },
            referenceModule: {
              followerOnlyReferenceModule: true
            }
          }
        }
      },
      headers: {
        'x-access-token': `Bearer ${accessToken}`
      }
    });

    let signature = await signMessage(createPostTypedDataResponse.data.data.createPostTypedData);

    let broadcastResponse = await broadcastTransaction(
      accessToken,
      createPostTypedDataResponse.data.data.createPostTypedData.id,
      signature
    );
    const revise = new Revise({
      auth: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmMWZjMTcwLTllZWQtNDU4OC05MzUwLWM0M2VlOGU4NmU0OSIsImtleSI6ImUyczMyNzh4IiwiaWF0IjoxNjcwMDU5NDI0fQ.r5_qRwXyvizqQDEnVNmB4997LtJ7ccf3v3UH2zIBG-o'
    });
    let nft = await revise.fetchNFT(reviseNFTId[0].value);

    let { metaData } = nft;
    let posts = metaData.filter((prop) => Object.keys(prop).includes('posts'));

    let result = await revise
      .nft(nft)
      // .setImage(`https://picsum.photos/id/${posts[0].posts + 1}/400`)
      .setImage(`https://lensparty-production.up.railway.app/svg/${posts[0].posts + 1}`)
      .setProperty('posts', posts[0].posts + 1)
      .save();

    let { items } = await getProfileFollowers(profileId);

    let addressSet = items.map((follower) => {
      return `eip155:80001:${follower.wallet.address}`;
    });

    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);

    const apiResponse = await PushAPI.payloads.sendNotification({
      signer: wallet,
      type: 4, // target
      identityType: 2, // direct payload
      notification: {
        title: `${posterProfile.handle} posted in ${profile.handle}`,
        body: `${posterProfile.handle} posted in ${profile.handle}`
      },
      payload: {
        title: `${posterProfile.handle} posted in ${profile.handle}`,
        body: `${posterProfile.handle} posted in ${profile.handle}`,
        cta: '',
        img: ''
      },
      recipients: addressSet, // recipient address
      channel: 'eip155:80001:0x22ae7Cf4cD59773f058B685a7e6B7E0984C54966', // your channel address
      env: 'staging'
    });

    res.status(200).json({
      data: broadcastResponse
    });
  } else {
    res.status(200).json({
      data: {
        errorMessage: 'wallet does not satisfy conditions'
      }
    });
  }
});

// app.post('/optin', authenticateMiddleWare, requiresToken, async (req, res, next) => {
//   let { address } = res.locals.jwtDecoded;
//   let { accessToken } = await parseTokens();
//   let { profileId } = req.body;

//   let profile = await getProfileUsingProfileId(profileId);
//   console.log(profile);
//   let optedIn = profile.attributes.filter((attribute) => attribute.key === 'optedIn');
//   let newAttributes = profile.attributes.filter((attribute) => attribute.key !== 'optedIn');

//   if (optedIn.length) {
//     optedIn[0].value = optedIn[0].value.length > 0 ? `${optedIn[0].value},${address}` : `${address}`;
//     newAttributes.push(optedIn[0]);
//   } else {
//     newAttributes.push({ traitType: 'string', key: 'optedIn', value: address });
//   }

//   let metadata = {
//     ...profile.metadata,
//     attributes: newAttributes
//   };

//   let setMetadataResponse = await axios({
//     url: API_URL,
//     method: 'post',
//     data: {
//       query: setProfileMetadata,
//       variables: {
//         request: {
//           profileId,
//           metadata
//         }
//       }
//     },
//     headers: {
//       'x-access-token': `Bearer ${accessToken}`
//     }
//   });

//   let signature = await signMessage(setMetadataResponse.data.data.createSetProfileMetadataTypedData);

//   let broadcastResponse = await broadcastTransaction(
//     accessToken,
//     setMetadataResponse.data.data.createSetProfileMetadataTypedData.id,
//     signature
//   );

//   res.status(200).json({
//     data: broadcastResponse
//   });
// });

app.get('/hastransactionbeenindexed', async (req, res, next) => {
  let { txHash } = req.query;
  let { accessToken } = parseTokens();

  let result = await hasTxBeenIndexed(accessToken, txHash);

  res.status(200).json({ data: result });
});

app.get('/svg/:post', async (req, res, next) => {
  let { post } = req.params.post;

  let buffer = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="300" height="300" viewBox="0 0 1080 1080" xml:space="preserve"><desc>Created with Fabric.js 5.2.4</desc><defs></defs><g transform="matrix(1 0 0 1 540 540)" id="39f5007a-21e8-4579-9e06-ce979cc0e7fc"><rect style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1; visibility: hidden;" vector-effect="non-scaling-stroke" x="-540" y="-540" rx="0" ry="0" width="1080" height="1080"/></g><g transform="matrix(1 0 0 1 540 540)" id="b2eacb88-a819-474f-bc04-3fe88228955e"></g><g transform="matrix(1 0 0 1 540 835.7)" style="" id="41414c05-bea9-4bbb-b05a-6631c150ac8a"><text xml:space="preserve" font-family="Alegreya" font-size="80" font-style="normal" font-weight="700" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1; white-space: pre;"><tspan x="-88.24" y="25.13">Posts</tspan></text></g><g transform="matrix(1 0 0 1 540 462.78)" style="" id="e145f7c9-db59-40da-8538-af404c48ccd5"><text xml:space="preserve" font-family="Raleway" font-size="200" font-style="normal" font-weight="900" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1; white-space: pre;"><tspan x="-61.4" y="62.83">${post}</tspan></text></g></svg>`
  );
  let base64 = buffer.toString('base64');
  console.log(`data:image/svg+xml;base64,${base64}`);
  res.send(`data:image/svg+xml;base64,${base64}`);
});

app.listen(PORT, () => {
  console.log('Listening at port: ', PORT);
  Moralis.start({
    apiKey: process.env.MORALIS_API_KEY
  });
});
