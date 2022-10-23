const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});



it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});


it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:2000000000});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    // need to take into account gas price, so balance after transaction will be less
    // than balance before transaction minus star price
    // balanceAfter = balanceBefore -starPrice - gasFees
    // we will check that: starPrice < value < starPrice + a small value
    let success = false
    if (value > starPrice && value < (starPrice+web3.utils.toWei(".00001", "ether"))) {
        success = true
    }
    assert.equal(success, true)
    // assert.equal(value, starPrice);

});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let instance = await StarNotary.deployed();
    assert.equal(await instance.getTokenName.call(), "Seb Stars")
    assert.equal(await instance.getTokenSymbol.call(), "STAR")
});
    // 1. create a Star with different tokenId
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided

it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    let tokenId1 = 6
    let tokenId2 = 7
    let instance = await StarNotary.deployed()
    await instance.createStar('Star 6', tokenId1, {from: accounts[0]})
    await instance.createStar('Star 7', tokenId2, {from: accounts[1]})
    assert.equal(await instance.ownerOf.call(6), accounts[0], "before exchange, owner is not correct")
    assert.equal(await instance.ownerOf.call(7), accounts[1], "before exchange, owner is not correct")
    // check that if the caller does not own any of the stars, we got an error message
    try {
        await instance.exchangeStars.call(6, 7, {from: accounts[2]})
        // if the previous line does not throw an error:
        assert.equal(true, false)
    } catch (err) {
    }
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars.call(6, 7, {from: accounts[0]})
    // 3. Verify that the owners changed
    assert.equal(await instance.ownerOf.call(6), accounts[1], "after exchange, owner is not correct")
    assert.equal(await instance.ownerOf.call(7), accounts[0])    
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    // 2. use the transferStar function implemented in the Smart Contract
    // 3. Verify the star owner changed.
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
    let tokenId = 10;
    let instance = await StarNotary.deployed();
    await instance.createStar('My amazing name', tokenId, {from: accounts[0]})
    assert.equal(await instance.lookUptokenIdToStarInfo.call(10), 'My amazing name')
});