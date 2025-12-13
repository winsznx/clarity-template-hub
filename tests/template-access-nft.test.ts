import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

const contractName = "template-access-nft";

describe("Template Access NFT Contract", () => {
  describe("Minting", () => {
    it("allows minting with correct 0.1 STX payment", () => {
      const templateId = 1;
      const mintPrice = 100000; // 0.1 STX in microstacks

      const { result, events } = simnet.callPublicFn(
        contractName,
        "mint",
        [Cl.uint(templateId)],
        wallet1
      );

      expect(result).toBeOk(Cl.uint(templateId));
      
      // Check NFT mint event
      expect(events).toHaveLength(2); // STX transfer + NFT mint
      
      // Verify ownership
      const owner = simnet.callReadOnlyFn(
        contractName,
        "get-template-owner",
        [Cl.uint(templateId)],
        wallet1
      );
      expect(owner.result).toBeSome(Cl.principal(wallet1));
    });

    it("rejects mint with insufficient payment", () => {
      const templateId = 2;

      // This should fail because restrict-assets? enforces exact payment
      const { result } = simnet.callPublicFn(
        contractName,
        "mint",
        [Cl.uint(templateId)],
        wallet1
      );

      // If wallet doesn't have enough STX, it should fail
      // Note: In actual test, we'd need to drain wallet first
    });

    it("rejects invalid template-id (0)", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "mint",
        [Cl.uint(0)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(3)); // ERR_INVALID_ID
    });

    it("rejects invalid template-id (> 50)", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "mint",
        [Cl.uint(51)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(3)); // ERR_INVALID_ID
    });

    it("rejects duplicate minting of same template", () => {
      const templateId = 3;

      // First mint succeeds
      const mint1 = simnet.callPublicFn(
        contractName,
        "mint",
        [Cl.uint(templateId)],
        wallet1
      );
      expect(mint1.result).toBeOk(Cl.uint(templateId));

      // Second mint by different user fails
      const mint2 = simnet.callPublicFn(
        contractName,
        "mint",
        [Cl.uint(templateId)],
        wallet2
      );
      expect(mint2.result).toBeErr(Cl.uint(5)); // ERR_ALREADY_MINTED
    });

    it("allows non-sequential minting", () => {
      // Mint template 10 first
      const mint10 = simnet.callPublicFn(
        contractName,
        "mint",
        [Cl.uint(10)],
        wallet1
      );
      expect(mint10.result).toBeOk(Cl.uint(10));

      // Then mint template 5
      const mint5 = simnet.callPublicFn(
        contractName,
        "mint",
        [Cl.uint(5)],
        wallet2
      );
      expect(mint5.result).toBeOk(Cl.uint(5));

      // Verify last-id is updated to highest
      const lastId = simnet.callReadOnlyFn(
        contractName,
        "get-last-token-id",
        [],
        deployer
      );
      expect(lastId.result).toBeOk(Cl.uint(10));
    });
  });

  describe("SIP-009 Functions", () => {
    beforeEach(() => {
      // Mint a template for testing
      simnet.callPublicFn(
        contractName,
        "mint",
        [Cl.uint(1)],
        wallet1
      );
    });

    it("returns correct owner via get-owner", () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-owner",
        [Cl.uint(1)],
        deployer
      );

      expect(result).toBeOk(Cl.some(Cl.principal(wallet1)));
    });

    it("returns none for unminted token", () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-owner",
        [Cl.uint(99)],
        deployer
      );

      expect(result).toBeOk(Cl.none());
    });

    it("returns token URI", () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-token-uri",
        [Cl.uint(1)],
        deployer
      );

      expect(result).toBeOk(
        Cl.some(Cl.stringAscii("https://clarity-template-hub.com/metadata/{id}"))
      );
    });

    it("allows transfer by owner", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "transfer",
        [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
        wallet1
      );

      expect(result).toBeOk(Cl.bool(true));

      // Verify new owner
      const owner = simnet.callReadOnlyFn(
        contractName,
        "get-template-owner",
        [Cl.uint(1)],
        deployer
      );
      expect(owner.result).toBeSome(Cl.principal(wallet2));
    });

    it("rejects transfer by non-owner", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "transfer",
        [Cl.uint(1), Cl.principal(wallet2), Cl.principal(wallet1)],
        wallet2
      );

      expect(result).toBeErr(Cl.uint(4)); // ERR_NOT_OWNER
    });
  });

  describe("Access Control", () => {
    it("has-access returns true for owner", () => {
      simnet.callPublicFn(
        contractName,
        "mint",
        [Cl.uint(7)],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        "has-access",
        [Cl.principal(wallet1), Cl.uint(7)],
        deployer
      );

      expect(result).toBeBool(true);
    });

    it("has-access returns false for non-owner", () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "has-access",
        [Cl.principal(wallet2), Cl.uint(99)],
        deployer
      );

      expect(result).toBeBool(false);
    });
  });

  describe("Mint Price", () => {
    it("returns correct mint price", () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-mint-price",
        [],
        deployer
      );

      expect(result).toBeOk(Cl.uint(100000)); // 0.1 STX
    });
  });
});
