import axios from "axios";
import { APIGW_URL } from "../../Const";
import { CoreClaimClient } from "./coreClaimApi.client";

const coreClaimClient = new CoreClaimClient(APIGW_URL, axios);

