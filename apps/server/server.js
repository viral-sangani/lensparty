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

  let profileRequest = {
    handle,
    profilePictureUri,
    // followNFTURI,
    // feeFollowModule: {
    //   amount: {
    //     currency: '0xD40282e050723Ae26Aeb0F77022dB14470f4e011',
    //     value: '0.01'
    //   },
    //   recipient: '0xEEA0C1f5ab0159dba749Dc0BAee462E5e293daaF'
    // }
    followModule: followModule
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
          nftCollection !== null
            ? {
                displayType: 'number',
                traitType: 'nft',
                key: 'nftCollection',
                value: nftCollection
              }
            : {
                displayType: 'number',
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
  let { profileId } = req.query;
  let { accessToken } = parseTokens();

  let { address } = res.locals.jwtDecoded;

  let attributes = await getProfileAttribute(profileId, 'profileCreator');

  if (attributes[0].value === address) {
    let metadata = await uploadToIpfs(`${profileId}.json`, {
      name: 'stani',
      bio: 'test stani',
      cover_picture: null,
      attributes: [
        {
          displayType: 'number',
          traitType: 'nft',
          key: '0x60ae865ee4c725cd04353b5aab364553f56cef82',
          value: 1
        },
        {
          traitType: 'string',
          key: 'profileCreator',
          value: address
        }
      ],
      version: '1.0.0',
      metadata_id: v4(),
      appId: 'lenssomething'
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

  let nftContractAddress = conditions[0].value;

  // check if wallet meets the conditions to post
  let walletSatisfiesConditions = false;

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

    let { items } = await getProfileFollowers(profileId);

    let addressSet = items.map((follower) => {
      return `eip155:80001:${follower.wallet.address}`;
    });

    console.log(addressSet);

    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);

    const apiResponse = await PushAPI.payloads.sendNotification({
      signer: wallet,
      type: 4, // target
      identityType: 2, // direct payload
      notification: {
        title: `${posterProfile.handle} posted in ${profile.handle}`,
        body: `about optimizations on LensTube, how well the videos load for you?`
      },
      payload: {
        title: `${posterProfile.handle} posted in ${profile.handle}`,
        body: `about optimizations on LensTube, how well the videos load for you?`,
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

app.get('/hastransactionbeenindexed', async (req, res, next) => {
  let { txHash } = req.query;
  let { accessToken } = parseTokens();

  let result = await hasTxBeenIndexed(accessToken, txHash);

  res.status(200).json({ data: result });
});

app.listen(PORT, () => {
  console.log('Listening at port: ', PORT);
  Moralis.start({
    apiKey: process.env.MORALIS_API_KEY
  });
});
