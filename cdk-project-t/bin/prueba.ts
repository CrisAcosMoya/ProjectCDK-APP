#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { PruebaStack } from '../lib/cft-s3';

const app = new cdk.App();
new PruebaStack(app, 'PruebaStack');
