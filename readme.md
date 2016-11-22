# ESTATE DASHBoard

## WuHan数据
从  http://scxx.whfcj.gov.cn/scxxbackstage/whfcj/channels/854.html 拿到商品房成交数据

database.json ：记录了房产信息网的4年的数据地址
estate : 记录了光谷和总数随日期的变化
estate_format.js : 是转化为Echart能加载的数据格式


## Requirement
- 11.22 多变量同一图表共存的问题
- 11.22 加入房价数据
- <del>11.17 平滑数据。SG算法比较好</del>
- 11.17 自动定时更新。
- 11.17 平移到sqlite。
- <del>11.10 每次都要抓取所有数据，改成增量更新。
- <del>9.9 房价走势图
- 9.9 房价热力图
