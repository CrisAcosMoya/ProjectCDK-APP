#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { PruebaStack } from '../lib/prueba-stack';

const app = new cdk.App();
new PruebaStack(app, 'PruebaStack');
