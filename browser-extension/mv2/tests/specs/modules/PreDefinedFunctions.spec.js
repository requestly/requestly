describe("PreDefined Functions: ", function () {
  describe("rq_rand(N) ", function () {
    var F = RQ.PreDefinedFunctions["rq_rand"];

    it("should replace rand usages with random value", function () {
      expect(/[0-9]{1}/.test(F.eval("rq_rand(1)"))).toBe(true);
      expect(/[0-9]{2}/.test(F.eval("rq_rand(2)"))).toBe(true);
      expect(/[0-9]{8}/.test(F.eval("rq_rand(10)"))).toBe(true);
      expect(/[0-9]{100}/.test(F.eval("rq_rand(100)"))).toBe(false);
      expect(F.eval("rq_rand(0)")).toBe("1");
    });

    it("should not do anything if pattern does not match", function () {
      expect(F.eval("rq_rand(1")).toBe("rq_rand(1");
      expect(F.eval("requestly_rocks")).toBe("requestly_rocks");
      expect(F.eval("rq_rand(1")).toBe("rq_rand(1");
    });

    it("should replace multiple rand usages with random values", function () {
      expect(/[0-9]{1}_[0-9]{1}/.test(F.eval("rq_rand(1)_rq_rand(1)"))).toBe(true);
      expect(/[0-9]{4}_[0-9]{5}/.test(F.eval("rq_rand(4)_rq_rand(5)"))).toBe(true);
      expect(/[0-9]{8}_[0-9]{8}/.test(F.eval("rq_rand(100)_rq_rand(1000)"))).toBe(true);
    });
  });

  describe("rq_encode(str)", function () {
    var F = RQ.PreDefinedFunctions["rq_encode"];

    it("should replace rq_encode usages with encoded value", function () {
      expect(F.eval("rq_encode(user+test@example.com)")).toBe("user%2Btest%40example.com");

      expect(F.eval("http://www.example.com/?password=rq_encode(P@$$W0rD)&val=123#rq_encode(my#string)")).toBe(
        "http://www.example.com/?password=P%40%24%24W0rD&val=123#my%23string"
      );

      expect(F.eval("http://www.example.com/?password=rq_encode(P@$$W0rD)&val=rq_rand(4)#rq_encode(my#string)")).toBe(
        "http://www.example.com/?password=P%40%24%24W0rD&val=rq_rand(4)#my%23string"
      );
    });
  });

  describe("rq_decode(str)", function () {
    var F = RQ.PreDefinedFunctions["rq_decode"];

    it("should replace rq_decode usages with encoded value", function () {
      expect(F.eval("rq_decode(user%2Btest%40example.com)")).toBe("user+test@example.com");

      expect(F.eval("http://www.example.com/rq_decode(%3Fquery%3Dnumber%26val%3D123%23hash)")).toBe(
        "http://www.example.com/?query=number&val=123#hash"
      );

      expect(F.eval("http://www.example.com/rq_decode(%3Fquery%3Dnumber)&val=rq_rand(3)rq_decode(%23hash)")).toBe(
        "http://www.example.com/?query=number&val=rq_rand(3)#hash"
      );
    });
  });

  describe("rq_increment(N,k)", function () {
    var F = RQ.PreDefinedFunctions["rq_increment"];

    it("should replace rq_increment usages with value incremented by 1", function () {
      expect(F.eval("rq_increment(10)")).toBe("11");
      expect(F.eval("http://www.example.com/?page=rq_increment(10)")).toBe("http://www.example.com/?page=11");
    });

    it("should replace rq_increment usages with value incremented by k", function () {
      expect(F.eval("rq_increment(10,3)")).toBe("13");
      expect(F.eval("http://www.example.com/?page=rq_increment(10,3)")).toBe("http://www.example.com/?page=13");
    });

    it("should replace rq_increment usages with value incremented by k ignoring spaces before/after comma", function () {
      expect(F.eval("rq_increment(10, 3)")).toBe("13");
      expect(F.eval("rq_increment(10 ,3)")).toBe("13");
      expect(F.eval("rq_increment(10 , 3)")).toBe("13");
      expect(F.eval("http://www.example.com/?page=rq_increment(10, 3)")).toBe("http://www.example.com/?page=13");
    });
  });

  describe("rq_decrement(N,k)", function () {
    var F = RQ.PreDefinedFunctions["rq_decrement"];

    it("should replace rq_decrement usages with value decremented by 1", function () {
      expect(F.eval("rq_decrement(10)")).toBe("9");
      expect(F.eval("http://www.example.com/?page=rq_decrement(10)")).toBe("http://www.example.com/?page=9");
    });

    it("should replace rq_decrement usages with value decremented by k", function () {
      expect(F.eval("rq_decrement(10,3)")).toBe("7");
      expect(F.eval("http://www.example.com/?page=rq_decrement(10,3)")).toBe("http://www.example.com/?page=7");
    });

    it("should replace rq_decrement usages with value decremented by k ignoring spaces before/after comma", function () {
      expect(F.eval("rq_decrement(10, 3)")).toBe("7");
      expect(F.eval("rq_decrement(10 ,3)")).toBe("7");
      expect(F.eval("rq_decrement(10 , 3)")).toBe("7");
      expect(F.eval("http://www.example.com/?page=rq_decrement(10, 3)")).toBe("http://www.example.com/?page=7");
    });
  });

  describe("rq_request_origin()", function () {
    var F = RQ.PreDefinedFunctions["rq_request_origin"];

    it("should replace rq_request_origin usage with the request initiator", function () {
      const initiator = "https://example.com";
      expect(F.eval("rq_request_origin()", { initiator })).toBe(initiator);
    });

    it("should replace rq_request_origin usage with the page origin when initiator is empty", function () {
      const pageOrigin = "https://example.com";
      const pageUrl = `${pageOrigin}/page`;

      spyOn(window.tabService, "getTabUrl").andReturn(pageUrl);
      expect(F.eval("rq_request_origin()", {})).toBe(pageOrigin);
    });

    it("should replace rq_request_origin usage with the page origin when initiator is null string", function () {
      const pageOrigin = "https://example.com";
      const pageUrl = `${pageOrigin}/page`;

      spyOn(window.tabService, "getTabUrl").andReturn(pageUrl);
      expect(F.eval("rq_request_origin()", { initiator: "null" })).toBe(pageOrigin);
    });

    it("should replace rq_request_origin usage with empty string when initiator is empty and tabService does not have record for the page", function () {
      const pageOrigin = "https://example.com";
      const pageUrl = `${pageOrigin}/page`;

      spyOn(window.tabService, "getTabUrl").andReturn("");
      expect(F.eval("rq_request_origin()", {})).toBe("");
    });
  });
});
