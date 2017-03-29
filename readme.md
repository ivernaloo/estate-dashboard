# ESTATE DASHBoard
一个展示房价变化的Dashboard

## workflow
- npm run debug: web的调试开发模式
- npm run data: 抓取并转换出最后的结果
- npm run verify: 验证数据信息
- npm run transform : 转化平滑数据
- npm run crawler: 抓取数据




## Data
- estate_format.js : 是转化为Echart能加载的数据格式，web显示的数据从这里加载的。17/3/29
- estate.json : 记录了光谷和总数随日期的变化，爬虫将数据记录在这个文件里。17/3/29
- database.json ：记录了房产信息网的4年的数据地址


来源从 [武汉房地产市场信息网](http://scxx.whfcj.gov.cn/scxxbackstage/whfcj/channels/854.html) 拿到商品房成交数据


## Requirement
- 17.3.29 定时任务
- 12.2 流程自动化
- 11.22 多变量同一图表共存的问题
- 11.22 加入房价数据
- <del>11.17 平滑数据。SG算法比较好</del>
- 11.17 自动定时更新。
- 11.17 平移到sqlite。
- <del>11.10 每次都要抓取所有数据，改成增量更新。</del>
- <del>9.9 房价走势图 </del>

## Demo
ParseTable: 解析table的JS脚本。17.3.28

## Problem
- 缺乏使用文档。17/3/28
- 需要部署到线上自动化  17/3/28
- 数据解析的模块需要更新 17/3/28





