import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum InvoiceStatus { PENDING = 0, PAID = 1, EXPIRED = 2, CLAIMED = 3 }

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  create_invoice(context: __compactRuntime.CircuitContext<PS>,
                 invoice_hash_0: Uint8Array,
                 expiry_0: bigint,
                 amount_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  pay_invoice(context: __compactRuntime.CircuitContext<PS>,
              invoice_id_0: bigint,
              secretKey_0: Uint8Array,
              payerNonce_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  generate_disclosure_proof(context: __compactRuntime.CircuitContext<PS>,
                            invoice_id_0: bigint,
                            secretKey_0: Uint8Array,
                            reveal_amount_0: boolean): __compactRuntime.CircuitResults<PS, [Uint8Array,
                                                                                            bigint]>;
  get_invoice_status(context: __compactRuntime.CircuitContext<PS>,
                     invoice_id_0: bigint): __compactRuntime.CircuitResults<PS, InvoiceStatus>;
}

export type ProvableCircuits<PS> = {
  create_invoice(context: __compactRuntime.CircuitContext<PS>,
                 invoice_hash_0: Uint8Array,
                 expiry_0: bigint,
                 amount_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  pay_invoice(context: __compactRuntime.CircuitContext<PS>,
              invoice_id_0: bigint,
              secretKey_0: Uint8Array,
              payerNonce_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  generate_disclosure_proof(context: __compactRuntime.CircuitContext<PS>,
                            invoice_id_0: bigint,
                            secretKey_0: Uint8Array,
                            reveal_amount_0: boolean): __compactRuntime.CircuitResults<PS, [Uint8Array,
                                                                                            bigint]>;
  get_invoice_status(context: __compactRuntime.CircuitContext<PS>,
                     invoice_id_0: bigint): __compactRuntime.CircuitResults<PS, InvoiceStatus>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  create_invoice(context: __compactRuntime.CircuitContext<PS>,
                 invoice_hash_0: Uint8Array,
                 expiry_0: bigint,
                 amount_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  pay_invoice(context: __compactRuntime.CircuitContext<PS>,
              invoice_id_0: bigint,
              secretKey_0: Uint8Array,
              payerNonce_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  generate_disclosure_proof(context: __compactRuntime.CircuitContext<PS>,
                            invoice_id_0: bigint,
                            secretKey_0: Uint8Array,
                            reveal_amount_0: boolean): __compactRuntime.CircuitResults<PS, [Uint8Array,
                                                                                            bigint]>;
  get_invoice_status(context: __compactRuntime.CircuitContext<PS>,
                     invoice_id_0: bigint): __compactRuntime.CircuitResults<PS, InvoiceStatus>;
}

export type Ledger = {
  readonly invoice_counter: bigint;
  invoices: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): { invoice_hash: Uint8Array,
                             expiry: bigint,
                             amount: bigint,
                             status: InvoiceStatus,
                             payer_commitment: Uint8Array
                           };
    [Symbol.iterator](): Iterator<[bigint, { invoice_hash: Uint8Array,
  expiry: bigint,
  amount: bigint,
  status: InvoiceStatus,
  payer_commitment: Uint8Array
}]>
  };
  nullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  readonly round: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
