const TestPermissioning = artifacts.require('Rules.sol');
var proxy;

var node1High = "0x9bd359fdc3a2ed5df436c3d8914b1532740128929892092b7fcb320c1b62f375";
var node1Low = "0x2e1092b7fcb320c1b62f3759bd359fdc3a2ed5df436c3d8914b1532740128929";
var node1Host = "0x0000000000000000000011119bd359fd";
var node1Port = 30303;

var node2High = "0x892092b7fcb320c1b62f3759bd359fdc3a2ed5df436c3d8914b1532740128929";
var node2Low = "0xcb320c1b62f37892092b7f59bd359fdc3a2ed5df436c3d8914b1532740128929";
var node2Host = "0x0000000000000000000011119bd359fd";
var node2Port = 30304;

var node3High = "0x765092b7fcb320c1b62f3759bd359fdc3a2ed5df436c3d8914b1532740128929";
var node3Low = "0x920982b7fcb320c1b62f3759bd359fdc3a2ed5df436c3d8914b1532740128929";
var node3Host = "0x0000000000000000000011117fc359fd";
var node3Port = 30305;

var newAdmin = "f17f52151EbEF6C7334FAD080c5704D77216b732";

contract('Permissioning WITH AUTHORITY ', () => {
  describe('Function: Permissioning + Authority', () => {
    it('Should NOT permit any node when none have been added', async () => {
      proxy = await TestPermissioning.new();
      let permitted = await proxy.enodeAllowed(node1High, node1Low, node1Host, node1Port);
      assert.equal(permitted, false, 'expected node NOT permitted');
    });

    it('Should compute key', async () => {
      let key1 = await proxy.computeKey(node1High, node1Low, node1Host, node1Port);
      let key2 = await proxy.computeKey(node1High, node1Low, node1Host, node1Port);
      assert.equal(key1, key2, "computed keys should be the same");

      let key3 = await proxy.computeKey(node1High, node1Low, node1Host, node2Port);
      assert(key3 != key2, "keys for different ports should be different");
    });

    it('Should add a node to the whitelist and then permit that node', async () => {
      // add node1
      await proxy.addEnode(node1High, node1Low, node1Host, node1Port);
      let permitted = await proxy.enodeAllowed(node1High, node1Low, node1Host, node1Port);
      assert.equal(permitted, true, 'expected node added to be permitted');
 
      // add node2
      await proxy.addEnode(node2High, node2Low, node2Host, node2Port);
      permitted = await proxy.enodeAllowed(node2High, node2Low, node2Host, node2Port);
      assert.equal(permitted, true, 'expected node 2 added to be permitted');
 
      // first one still permitted
      permitted = await proxy.enodeAllowed(node1High, node1Low, node1Host, node1Port);
      assert.equal(permitted, true, 'expected node 1 added to be permitted');

      // add node3
      await proxy.addEnode(node3High, node3Low, node3Host, node3Port);
      permitted = await proxy.enodeAllowed(node3High, node3Low, node3Host, node3Port);
      assert.equal(permitted, true, 'expected node 3 added to be permitted');
 
      // node1 still permitted
      permitted = await proxy.enodeAllowed(node1High, node1Low, node1Host, node1Port);
      assert.equal(permitted, true, 'expected node 1 added to be permitted');
      // node2 still permitted
      permitted = await proxy.enodeAllowed(node2High, node2Low, node2Host, node2Port);
      assert.equal(permitted, true, 'expected node 2 added to be permitted');
    });

    it('Should allow a connection between 2 added nodes', async () => {
      let permitted = await proxy.connectionAllowed(node1High, node1Low, node1Host, node1Port, node2High, node2Low, node2Host, node2Port);
      assert.equal(permitted, true, 'expected permitted node1 <> node2');
      permitted = await proxy.connectionAllowed(node1High, node1Low, node1Host, node1Port, node3High, node3Low, node3Host, node3Port);
      assert.equal(permitted, true, 'expected permitted node1 <> node3');
      permitted = await proxy.connectionAllowed(node2High, node2Low, node2Host, node2Port, node3High, node3Low, node3Host, node3Port);
      assert.equal(permitted, true, 'expected permitted node2 <> node3');
    });

    it('Should remove a node from the whitelist and then NOT permit that node', async () => {
      await proxy.removeEnode(node1High, node1Low, node1Host, node1Port);
      let permitted = await proxy.enodeAllowed(node1High, node1Low, node1Host, node1Port);
      assert.equal(permitted, false, 'expected removed node NOT permitted');

      permitted = await proxy.connectionAllowed(node1High, node1Low, node1Host, node1Port, node2High, node2Low, node2Host, node2Port);
      assert.equal(permitted, false, 'expected source disallowed since it was removed');
    });
  });
});