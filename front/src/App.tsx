import React from 'react';
import { isWeb3Injected, web3Accounts, web3Enable, web3FromSource, } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import {
  AppBar,
  Button,
  MenuItem,
  Select,
  TextField,
  Toolbar,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { getSomethingValue, submit } from './lib/api/substrate';
import { nodeTemplate } from './lib/substrate/pallets';
import './App.css';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  item: {
    margin: theme.spacing(2),
  },
}));

function App() {
  const [ status, setStatus ] = React.useState("init");
  const [ submitValue, setSubmitValue ] = React.useState(1);
  const [ saveValue, setSaveValue ] = React.useState(0);
  const [ allAccounts, setAllAccounts ] = React.useState<InjectedAccountWithMeta[]>([]);
  const [ currentAccount, setCurrentAccount ] = React.useState<number>(-1);
  const classes = useStyles();

  React.useEffect(() => {
    (async() => {
      if (!isWeb3Injected) {
        setStatus("not web3 injected");
        return;
      }
      const injectedExtensions = await web3Enable('Offline-sign');
      const polkadotJs = injectedExtensions.find(extension => extension.name === 'polkadot-js')
      if (!polkadotJs) {
          setStatus("extention not found");
          return;
      }
      const accounts = await web3Accounts();
      console.log("accounts ==== ", accounts);
      setAllAccounts(accounts);
      setStatus("ready");
    })()
  }, []);

  const handleSubmitNodeTemplate = async () => {
    const account = allAccounts[currentAccount];
    const injector = await web3FromSource(account.meta.source);
    const signer = injector.signer;
    const signedTxInjected = await nodeTemplate.getDoSomethingTx(account.address, signer, submitValue);
    const result = await submit(signedTxInjected);
    if (!result) {
      alert('Failed submit !!!!');
    }
  }

  const handleGetValue = async () => {
    const result = await getSomethingValue();
    console.log("somthing value = ", result);
    setSaveValue(result);
  }

  const handleSignerChange = (event: any) => {
    setCurrentAccount(event.target.value);
  };

  const handleTextFieldChange = (event: any) => {
    setSubmitValue(event.target.value);
  }

  return (
    <div className="App">
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              Sample
            </Typography>
          </Toolbar>
        </AppBar>
      </div>
      <div className={classes.item}>
        <Typography variant="h6">
          Status : { status }
        </Typography>
      </div>
      <div className={classes.item}>
        Signer(Sender): 
        <Select
          labelId="account-select-label"
          id="account-select"
          value={currentAccount}
          label="Signer"
          onChange={handleSignerChange}
        >
          <MenuItem value="-1">-----</MenuItem>
          {allAccounts && allAccounts.map((account, idx) => (
            <MenuItem value={idx}>{account.meta.name}</MenuItem>
          ))}
        </Select>
      </div>
      <div className={classes.item}>
        <TextField value={submitValue} id="standard-basic" label="Submit value" onChange={handleTextFieldChange} />
        <Button onClick={async () => { await handleSubmitNodeTemplate(); } } color="primary" variant="outlined">
          Submit to Node Template
        </Button>
      </div>
      <div className={classes.item}>
        <Button onClick={async () => { await handleGetValue(); } } variant="outlined">
          Get value from Substrate 
        </Button>
        <Typography>
          {saveValue}
        </Typography>
      </div>
    </div>
  );
}

export default App;
