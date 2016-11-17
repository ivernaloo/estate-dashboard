
var dom = document.getElementById("container");
var myChart = echarts.init(dom);
var app = {};
option = null;
option = {
    title: {
        text: '武汉房产销售量'
    },

    tooltip: {
        trigger: 'axis'
    },
    legend: {
        data: ["光谷","总量"]
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    toolbox: {
        feature: {
            saveAsImage: {}
        }
    },
    xAxis: {
        type: 'category',
        boundaryGap: false,
        data: DATA.time
    },
    yAxis: {
        type: 'value'
    },
    series: [
        // {
        //     name:'光谷',
        //     type:'line',
        //     stack: '光谷',
        //     symbol: 'none',
        //     smooth: true,
        //     data: DATA.guangu
        // },
        {
            name:'总量',
            type:'line',
            stack: '总量',
            symbol: 'none',
            smooth: true,
            data: DATA.total
        }
    ]
};
;
if (option && typeof option === "object") {
    myChart.setOption(option, true);
}
