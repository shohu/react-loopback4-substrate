import axios from '../Axios';
import { OK_RESPONSE_CODE } from '../Const';

const getChainInfo = async (): Promise<any> => {
    const res = await axios.get(`/substrate/chain-info`, {})
        .catch((err: { response: any; }) => {
            return err.response
        });
    console.log('substrate.getChainInfo.res', res);
    if (!OK_RESPONSE_CODE.includes(res.status)) {
        console.error(`Failed api.substrate.getChainInfo()`);
        return false;
    }
    return res.data;
}

const getNonce = async (address: string): Promise<any> => {
    const res = await axios.get(`/substrate/nonce/${address}`, {})
    .catch((err: { response: any; }) => {
        return err.response
    });
    console.log('substrate.getNonce.res', res);
    if (!OK_RESPONSE_CODE.includes(res.status)) {
        console.error(`Failed api.substrate.getNonce()`);
        return false;
    }
    return res.data;
}

const getSomethingValue = async (): Promise<any> => {
    const res = await axios.get(`/substrate/something-value`, {})
    .catch((err: { response: any; }) => {
        return err.response
    });
    console.log('substrate.something.res', res);
    if (!OK_RESPONSE_CODE.includes(res.status)) {
        console.error(`Failed api.substrate.getSomethingValue()`);
        return false;
    }
    return res.data;
}

const submit = async (signedTx:string): Promise<boolean> => {
    const res = await axios.post(`/substrate/submit`, {
        signedTx,
    }).catch((err: { response: any; }) => {
        return err.response
    });
    console.log('substrate.submit.res', res);
    if (!OK_RESPONSE_CODE.includes(res.status)) {
        console.error(`Substrateの処理に失敗しました`);
        return false;
    }
    return true;
}

export {
    getChainInfo,
    getNonce,
    getSomethingValue,
    submit,
}