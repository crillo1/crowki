/* eslint-disable react-hooks/exhaustive-deps */
import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Divider from "@mui/material/Divider";
import { styled } from "@mui/system";
import { useLocation } from "react-router-dom";
import Web3 from "web3";
import treasuryImg from "../../assets/treasury.png"
import profitImg from "../../assets/profit.png"

import PriceInput from "../../components/PriceInput";
import { useContractContext } from "../../providers/ContractProvider";
import { useAuthContext } from "../../providers/AuthProvider";
import { useEffect, useState } from "react";
import { config } from "../../config";

const CardWrapper = styled(Card)({
  background: "rgb(251 241 225)",
  marginBottom: 24,
});

const ButtonContainer = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    "> div": {
      marginLeft: 0,
      marginRight: 0,
    },
  },
}));

let timeout = null;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function BakeCard() {
  const { contract, wrongNetwork, getBnbBalance, fromWei, toWei, web3 } =
    useContractContext();
  const { address, chainId } = useAuthContext();
  const [contractBNB, setContractBNB] = useState(0);
  const [walletBalance, setWalletBalance] = useState({
    bnb: 0,
    beans: 0,
    rewards: 0,
  });
  const [bakeBNB, setBakeBNB] = useState(0);
  const [calculatedBeans, setCalculatedBeans] = useState(0);
  const [loading, setLoading] = useState(false);
  const query = useQuery();

  const fetchContractBNBBalance = () => {
    if (!web3 || wrongNetwork) {
      setContractBNB(0);
      return;
    }
    getBnbBalance(config.contractAddress).then((amount) => {
      setContractBNB(fromWei(amount));
    });
  };

  const fetchWalletBalance = async () => {
    if (!web3 || wrongNetwork || !address) {
      setWalletBalance({
        bnb: 0,
        beans: 0,
        rewards: 0,
      });
      return;
    }

    try {
      const [bnbAmount, beansAmount, rewardsAmount] = await Promise.all([
        getBnbBalance(address),
        contract.methods
          .getMyMiners(address)
          .call()
          .catch((err) => {
            console.error("myminers", err);
            return 0;
          }),
        contract.methods
          .beanRewards(address)
          .call()
          .catch((err) => {
            console.error("beanrewards", err);
            return 0;
          }),
      ]);
      setWalletBalance({
        bnb: fromWei(`${bnbAmount}`),
        beans: beansAmount,
        rewards: fromWei(`${rewardsAmount}`),
      });
    } catch (err) {
      console.error(err);
      setWalletBalance({
        bnb: 0,
        beans: 0,
        rewards: 0,
      });
    }
  };

  useEffect(() => {
    fetchContractBNBBalance();
  }, [web3, chainId]);

  useEffect(() => {
    fetchWalletBalance();
  }, [address, web3, chainId]);

  const onUpdateBakeBNB = (value) => {
    setBakeBNB(value);
  };

  const getRef = () => {
    const ref = Web3.utils.isAddress(query.get("ref"))
      ? query.get("ref")
      : "0x0000000000000000000000000000000000000000";
    return ref;
  };

  const bake = async () => {
    setLoading(true);

    const ref = getRef();

    try {
      await contract.methods.buyEggs(ref).send({
        from: address,
        value: toWei(`${bakeBNB}`),
      });
    } catch (err) {
      console.error(err);
    }
    fetchWalletBalance();
    fetchContractBNBBalance();
    setLoading(false);
  };

  const reBake = async () => {
    setLoading(true);

    const ref = getRef();

    try {
      await contract.methods.hatchEggs(ref).send({
        from: address,
      });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const eatBeans = async () => {
    setLoading(true);

    try {
      await contract.methods.sellEggs().send({
        from: address,
      });
    } catch (err) {
      console.error(err);
    }
    fetchWalletBalance();
    fetchContractBNBBalance();
    setLoading(false);
  };



  return (
    <div>
      <div className="auxContent">
        <div className="box leftBox contractInfoCard" >
        <div style={{marginTop:"20px"}}>
            <div>
            </div>
            <div style={{display: "center"}}></div>

            <div>
              {<div className="dataRow">
              <div className="name"><h5>Crowki Contract</h5>
              </div>
              <div className="value"><h5>{contractBNB} CRO</h5></div>
              <img src={treasuryImg}></img>

            </div>}
            </div>
          </div>
        </div>
        <div className="box leftBox profitInfoCard">
          <div style={{display: "flex"}}>
            <img src={profitImg}></img>
            <div>
              <h5>Daily Returns</h5>
              <h5><b>5%</b></h5>
            </div>
          </div>

            <div className="dataRow">
              <div className="name"><h5><b>APR</b></h5></div>
              <div className="value"><h4><b>1860 %</b></h4></div>
            </div>
            <div className="dataRow">
              <div className="name"><h5><b>Deposit fee</b></h5></div>
              <div className="value"><h4><b>5%</b></h4></div>
            </div>

        </div>
      </div>
      <div className="mainContent">
        <div className="box leftBox">
          {loading && <LinearProgress color="secondary" />}
          <div>
            {/*<div className="dataRow">
              <div className="name">Contract</div>
              <div className="value">{contractBNB} BNB</div>
              </div>*/}
            <div style={{color:"black", marginTop:"5px"}}></div>
            <div className="dataRow">
              <div className="name"><h5><b>CRO in wallet:</b></h5></div>
              <div className="value"><h5><b>{walletBalance.bnb} CRO</b></h5></div>
            </div>
            <div className="dataRow">
              <div className="name"> <h5><b>Your worms:</b></h5></div>
              <div className="value"><h5><b>{walletBalance.beans}</b></h5></div>
            </div>

            <Box >
              <Box>
                <PriceInput
                  max={+walletBalance.bnb}
                  value={bakeBNB}
                  onChange={(value) => onUpdateBakeBNB(value)}
                />
              </Box>
              <Box marginTop={4} marginBottom={4}>
                <Button
                  className="button1"
                  color="secondary"
                  variant="contained"
                  fullWidth
                  disabled={wrongNetwork || !address || +bakeBNB === 0 || loading}
                  onClick={bake}
                >
                  <b>COOK WORMS</b>
                </Button>
              </Box>
              {/* <Divider /> */}
              {<div className="dataRow">
                <div className="name"><h3><b>Rewards:</b></h3></div>
                <div className="value"><h3><b>{walletBalance.rewards} CRO</b></h3></div>
              </div>}

              {<ButtonContainer container>
                <Grid item flexGrow={1} marginRight={1} marginTop={3}>
                  <Button
                    className="button1"
                    variant="contained"
                    color="secondary"
                    fullWidth
                    disabled={wrongNetwork || !address || loading}
                    onClick={reBake}
                  >
                    <b>RE-COOK</b>
                  </Button>
                </Grid>
                <Grid item flexGrow={1} marginLeft={1} marginTop={3}>
                  <Button
                    className="button1"
                    variant="contained"
                    color="secondary"
                    fullWidth
                    disabled={wrongNetwork || !address || loading}
                    onClick={eatBeans}
                  >
                    <b>EAT WORMS</b>
                  </Button>
                </Grid>
              </ButtonContainer>}
            </Box>
          </div>
        </div>
        {/*<div className="box leftBox">
          <Typography variant="h5" style={{color:"white", fontFamily:"sans-serif", fontSize:"25px"}}>
            <b>Your Rewards:</b>
          </Typography>
          <div>
            <div style={{color:"blue", marginTop:"20px"}}></div>
            <div className="dataRow">
              <div className="name"></div>
              <div className="value"></div>
            </div>
            <div className="dataRow">
              <div className="name"></div>
              <div className="value"></div>
            </div>
          </div>
          <div style={{marginTop:"20px"}}>
            <div style={{color:"blue", marginTop:"20px"}}></div>
            <div className="dataRow">
              <div className="name"></div>
              <div className="value"></div>
            </div>
          </div>}
          <ButtonContainer container>
              <Grid item flexGrow={1} marginRight={1} marginTop={3}>
                <Button
                  className="button1"
                  variant="contained"
                  color="secondary"
                  fullWidth
                  disabled={wrongNetwork || !address || loading}
                  onClick={reBake}
                >
                  <b>RE-GRILL</b>
                </Button>
              </Grid>
              <Grid item flexGrow={1} marginLeft={1} marginTop={3}>
                <Button
                  className="button1"
                  variant="contained"
                  color="secondary"
                  fullWidth
                  disabled={wrongNetwork || !address || loading}
                  onClick={eatBeans}
                >
                  <b>EAT FISH</b>
                </Button>
              </Grid>
          </ButtonContainer>*/}
        </div>
      </div>
  );
}
