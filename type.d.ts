/* eslint-disable */
import * as React from 'react';

export function createCall<
  T extends any[] = any[], 
  R extends React.ReactNode = React.ReactNode, 
  Props = any,
>(
  children: React.ReactNode,
  handleReturns: (returns: T) => R,
  props: Props,
): R

export function createReturn(value: any): React.ReactNode;