import {inject} from '@loopback/core';
import {
  Request,
  RestBindings,
  get,
  param,
  post,
  response,
  requestBody,
  ResponseObject,
} from '@loopback/rest';
import { AnyJson } from '@polkadot/types-codec/types';
import { SubstrateSingleton } from '../substrate/substrate.singleton';


/**
 * Substrateへのアクセスを管理するコントローラークラス
 */
export class SubstrateController {
  constructor(@inject(RestBindings.Http.REQUEST) private req: Request) {}

  /**
   * 署名済TX文字列を受け取りSubstrateへSubmit
   */
  @post('/substrate/submit')
  async submit(
    @requestBody({
      content: {
        'application/json': {
          type: 'object',
          description: 'Substrate submit',
          required: ['signedTx'],
          schema: {
            properties: {
              signedTx: {
                type: 'string',
              },
            },
          }
        },
      },
    })
    req: {signedTx: string},
  ): Promise<boolean> {
    let substrate = await SubstrateSingleton.getInstance();
    const result = await substrate.submit(req.signedTx);
    if (!result) return false;
    console.log(result);  // eventをログに出力
    return true;
  }

  /**
   * Substrateのノード情報を取得
   */
  @get('/substrate/chain-info')
  async getChainInfoForClient(): Promise<AnyJson> {
    let substrate = await SubstrateSingleton.getInstance();
    const result = await substrate.getChainInfoForClient();
    if (!result) return false;
    return result;
  }

  /**
   * Substrate内に格納している数値の取得
   */
  @get('/substrate/something-value')
  @response(200)
  async getSomething(): Promise<Number> {
    let substrate = await SubstrateSingleton.getInstance();
    return substrate.getSomethingNumber();
  }

  /**
   * Substrate内に格納している数値の取得
   */
  @get('/substrate/nonce/{address}')
  async getNonce(
    @param.path.string('address') address: string,
  ): Promise<Number> {
    let substrate = await SubstrateSingleton.getInstance();
    return await substrate.getNonce(address);
  }
}
