# ESTATE DASHBoard
一个展示房价变化的Dashboard

## DEMO
ParseTable: 解析table的JS脚本。17.3.28

## Problem
- 缺乏使用文档。17/3/28
- 需要部署到线上自动化  17/3/28
- 数据解析的模块需要更新 17/3/28


## WuHan数据
从  http://scxx.whfcj.gov.cn/scxxbackstage/whfcj/channels/854.html 拿到商品房成交数据

database.json ：记录了房产信息网的4年的数据地址
estate : 记录了光谷和总数随日期的变化
estate_format.js : 是转化为Echart能加载的数据格式


## Requirement
- 12.2 流程自动化
- 11.22 多变量同一图表共存的问题
- 11.22 加入房价数据
- <del>11.17 平滑数据。SG算法比较好</del>
- 11.17 自动定时更新。
- 11.17 平移到sqlite。
- <del>11.10 每次都要抓取所有数据，改成增量更新。
- <del>9.9 房价走势图
- 9.9 房价热力图

## workflow
- npm run crawler: 抓取数据
- npm run transform : 转化平滑数据
