import * as awsx from '@pulumi/awsx'
import { cluster } from './cluster'

export const appLoadBalancer = new awsx.classic.lb.ApplicationLoadBalancer('app-lb', {
  securityGroups: cluster.securityGroups // SG para enxergar os serviços vivos nesse cluster na aws
}) // Esse loadBalancer só funciona com HTTP/HTTPS

export const networkLoadBalancer = new awsx.classic.lb.NetworkLoadBalancer('net-lb', {
  subnets: cluster.vpc.publicSubnetIds,
}) // funciona com tcp/udp