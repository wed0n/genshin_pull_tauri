import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { TooltipComponent, TitleComponent, LegendComponent, GridComponent, DataZoomComponent, ToolboxComponent, MarkPointComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers';
import { Box } from '@mui/material';
import { EChartsOption } from 'echarts-for-react';
import { GenshinTimeLine } from './interfaces';
echarts.use([BarChart, TooltipComponent, TitleComponent, LegendComponent, CanvasRenderer, GridComponent, DataZoomComponent, ToolboxComponent, MarkPointComponent]);
export default function TimeLine(props: {data:GenshinTimeLine}) {
    let xAxis=[];
    let star5=[];
    let star4=[];
    let star3=[];
    for(let item of props.data.items){
        xAxis.push(item.time);
        star5.push(item.star5);
        star4.push(item.star4);
        star3.push(item.star3);
    }
    let option: EChartsOption = {
        color: ['#6ABCE6', '#CC99FF', '#FFD173'],
        legend: {top: 25},
        title: {
            "left": "center",
            "text": `${props.data.begin_time} - ${props.data.end_time} (共${props.data.total}抽)`,
        },
        xAxis: {
            data: xAxis
        },
        yAxis: {
            type: 'value',
            boundaryGap: false,
        },
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100
            },
            {
                start: 100,
                end: 0
            }
        ],
        tooltip: {
            trigger: 'axis',
            formatter(series: any[]) {
                if (series.length === 0) return '';
                const day = series[0].axisValue;
                let total = 0;
                let target = '';
                series.reverse().map(
                    (data) => {
                        total += data.data;
                        target += `<div>
                        ${data.marker}
                        <span style="margin-left:2px">${data.seriesName}</span>
                        <span style="float:right;margin-left:20px;font-weight:900;color=${data.color}">${data.value}</span>
                  </div>`
                    }
                )
                return `<div style="font-size:14px;color:#666;font-weight:400;line-height:1.5;">
                <div>${day}</div>
                <div>当日抽卡次数: <span style="font-weight:900">${total}<span></div>
                ${target}
                </div>`;
            },
        },
        series: [
            {
                name: "三星",
                data: star3,
                type: 'bar',
                stack: 'x'
            },
            {
                name: "四星",
                data: star4,
                type: 'bar',
                stack: 'x'
            },
            {
                name: "五星",
                data: star5,
                type: 'bar',
                stack: 'x'
            }
        ]
    };
    /*     
        const option = {
            "tooltip": {
                "trigger": "axis"
            },
            "title": {
                "left": "center",
                "text": "2021-11-25 - 2022-12-09 (共1000抽)",
            },
            "legend": {
                "top": 25,
                "data": [
                    "3 星",
                    "4 星",
                    "5 星"
                ]
            },
            "yAxis": {
                "type": "value",
                "boundaryGap": false
            },
            "dataZoom": [
                {
                    "type": "inside",
                    "start": 0,
                    "end": 100
                },
                {
                    "start": 0,
                    "end": 100
                }
            ],
            "xAxis": {
                "type": "category",
                "data": [
                    "2021-11-25",
                    "2021-11-26",
                    "2021-11-28",
                    "2021-11-29",
                    "2021-12-01",
                    "2021-12-02",
                    "2021-12-03",
                    "2021-12-04",
                    "2021-12-05",
                    "2021-12-06",
                    "2021-12-07",
                    "2021-12-09",
                    "2021-12-10",
                    "2021-12-11",
                    "2021-12-12",
                    "2021-12-13",
                    "2021-12-14",
                    "2021-12-15",
                    "2021-12-16",
                    "2021-12-17",
                    "2021-12-20",
                    "2021-12-21",
                    "2021-12-22",
                    "2021-12-24",
                    "2021-12-26",
                    "2021-12-27",
                    "2021-12-28",
                    "2021-12-30",
                    "2021-12-31",
                    "2022-01-01",
                    "2022-01-03",
                    "2022-01-05",
                    "2022-01-06",
                    "2022-01-07",
                    "2022-01-08",
                    "2022-01-09",
                    "2022-01-10",
                    "2022-01-14",
                    "2022-01-17",
                    "2022-01-25",
                    "2022-01-26",
                    "2022-01-27",
                    "2022-01-30",
                    "2022-01-31",
                    "2022-02-01",
                    "2022-02-03",
                    "2022-02-05",
                    "2022-02-06",
                    "2022-02-09",
                    "2022-02-16",
                    "2022-02-18",
                    "2022-02-19",
                    "2022-02-20",
                    "2022-02-21",
                    "2022-02-23",
                    "2022-02-24",
                    "2022-02-25",
                    "2022-03-01",
                    "2022-03-02",
                    "2022-03-05",
                    "2022-03-08",
                    "2022-03-09",
                    "2022-03-11",
                    "2022-03-17",
                    "2022-03-18",
                    "2022-03-20",
                    "2022-03-22",
                    "2022-03-23",
                    "2022-03-25",
                    "2022-03-30",
                    "2022-03-31",
                    "2022-04-02",
                    "2022-04-04",
                    "2022-04-19",
                    "2022-04-20",
                    "2022-04-21",
                    "2022-05-01",
                    "2022-05-04",
                    "2022-05-09",
                    "2022-05-11",
                    "2022-05-16",
                    "2022-05-17",
                    "2022-05-18",
                    "2022-05-20",
                    "2022-05-21",
                    "2022-05-25",
                    "2022-05-28",
                    "2022-05-29",
                    "2022-05-30",
                    "2022-06-01",
                    "2022-06-19",
                    "2022-06-22",
                    "2022-06-26",
                    "2022-06-30",
                    "2022-07-06",
                    "2022-07-13",
                    "2022-07-19",
                    "2022-07-21",
                    "2022-07-26",
                    "2022-08-01",
                    "2022-08-03",
                    "2022-08-10",
                    "2022-08-13",
                    "2022-08-15",
                    "2022-08-24",
                    "2022-08-25",
                    "2022-08-26",
                    "2022-08-28",
                    "2022-08-29",
                    "2022-08-31",
                    "2022-09-01",
                    "2022-09-07",
                    "2022-09-08",
                    "2022-09-09",
                    "2022-09-11",
                    "2022-09-15",
                    "2022-09-16",
                    "2022-09-19",
                    "2022-09-22",
                    "2022-09-23",
                    "2022-10-01",
                    "2022-10-02",
                    "2022-10-03",
                    "2022-10-04",
                    "2022-10-05",
                    "2022-10-12",
                    "2022-10-16",
                    "2022-10-26",
                    "2022-11-01",
                    "2022-11-02",
                    "2022-11-18",
                    "2022-12-03",
                    "2022-12-06",
                    "2022-12-07",
                    "2022-12-09"
                ]
            },
            "series": [
                {
                    "name": "3 星",
                    "type": "bar",
                    "stack": "total",
                    "itemStyle": {
                        "color": "#4D8DF7"
                    },
                    "data": [
                        2,
                        1,
                        3,
                        1,
                        11,
                        1,
                        5,
                        4,
                        4,
                        2,
                        3,
                        3,
                        1,
                        3,
                        3,
                        4,
                        5,
                        1,
                        1,
                        1,
                        4,
                        1,
                        1,
                        4,
                        3,
                        1,
                        1,
                        1,
                        2,
                        14,
                        2,
                        8,
                        2,
                        3,
                        1,
                        2,
                        2,
                        11,
                        2,
                        23,
                        1,
                        7,
                        1,
                        9,
                        15,
                        1,
                        0,
                        1,
                        9,
                        10,
                        8,
                        0,
                        7,
                        1,
                        7,
                        1,
                        0,
                        16,
                        2,
                        3,
                        7,
                        1,
                        1,
                        10,
                        4,
                        2,
                        2,
                        1,
                        0,
                        4,
                        9,
                        19,
                        2,
                        32,
                        1,
                        0,
                        14,
                        7,
                        3,
                        3,
                        4,
                        3,
                        4,
                        2,
                        1,
                        4,
                        1,
                        3,
                        1,
                        11,
                        2,
                        9,
                        0,
                        1,
                        3,
                        49,
                        11,
                        8,
                        8,
                        6,
                        8,
                        2,
                        8,
                        1,
                        24,
                        7,
                        5,
                        0,
                        8,
                        5,
                        11,
                        5,
                        3,
                        14,
                        2,
                        2,
                        29,
                        5,
                        3,
                        0,
                        6,
                        1,
                        2,
                        3,
                        1,
                        1,
                        0,
                        9,
                        7,
                        59,
                        17,
                        51,
                        2,
                        45,
                        5
                    ]
                },
                {
                    "name": "4 星",
                    "type": "bar",
                    "stack": "total",
                    "itemStyle": {
                        "color": "#A65FE2"
                    },
                    "data": [
                        1,
                        0,
                        0,
                        0,
                        2,
                        0,
                        1,
                        1,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        2,
                        0,
                        0,
                        1,
                        0,
                        0,
                        1,
                        0,
                        1,
                        0,
                        0,
                        1,
                        1,
                        0,
                        1,
                        0,
                        2,
                        0,
                        0,
                        1,
                        0,
                        1,
                        1,
                        1,
                        4,
                        0,
                        1,
                        0,
                        1,
                        1,
                        1,
                        1,
                        0,
                        1,
                        1,
                        0,
                        1,
                        0,
                        1,
                        0,
                        0,
                        1,
                        2,
                        0,
                        1,
                        0,
                        0,
                        1,
                        1,
                        0,
                        0,
                        0,
                        0,
                        1,
                        1,
                        1,
                        1,
                        1,
                        3,
                        0,
                        1,
                        3,
                        1,
                        0,
                        1,
                        0,
                        1,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        4,
                        0,
                        1,
                        1,
                        0,
                        0,
                        8,
                        1,
                        1,
                        1,
                        1,
                        1,
                        1,
                        2,
                        0,
                        3,
                        2,
                        0,
                        1,
                        1,
                        0,
                        5,
                        0,
                        1,
                        2,
                        0,
                        0,
                        4,
                        0,
                        0,
                        1,
                        1,
                        0,
                        0,
                        1,
                        0,
                        0,
                        1,
                        1,
                        0,
                        11,
                        3,
                        9,
                        0,
                        5,
                        1
                    ]
                },
                {
                    "name": "5 星",
                    "type": "bar",
                    "stack": "total",
                    "markPoint": {
                        "label": {
                            "color": "#fff"
                        },
                        "itemStyle": {
                            "color": "#4D8DF7"
                        },
                        "data": [
                            {
                                "name": "抽卡数最多",
                                "value": 73,
                                "xAxis": 129,
                                "yAxis": 73
                            }
                        ]
                    },
                    "itemStyle": {
                        "color": "#FAC858"
                    },
                    "data": [
                        0,
                        0,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        1,
                        2,
                        0,
                        0,
                        1,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        1,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        1,
                        0,
                        0,
                        3,
                        0,
                        1,
                        0,
                        0,
                        1
                    ]
                }
            ]
        }; */
    return (
        <Box sx={{ width: 900,marginX: 'auto', marginY: 2}}>
            <ReactEChartsCore echarts={echarts} option={option} />
        </Box>
    );
}