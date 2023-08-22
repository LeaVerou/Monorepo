import React, { useState, useMemo } from 'react'
import { BlockContext } from 'core/blocks/types'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import { RankingChart, RankingChartSerie } from 'core/charts/toolsRatiosRanking/RankingChart'
import ButtonGroup from 'core/components/ButtonGroup'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import { useI18n } from 'core/i18n/i18nContext'
import { getTableData } from 'core/helpers/datatables'
import { MODE_GRID } from 'core/filters/constants'
import { MetricId } from 'core/helpers/units'
import DynamicDataLoader from 'core/filters/dataloaders/DynamicDataLoader'
import { useChartFilters } from 'core/filters/helpers'
import { ToolRatiosQuestionData, Entity, RatiosUnits } from '@devographics/types'
import { useEntities, getEntityName } from 'core/helpers/entities'
import { BlockDefinition } from 'core/types'

export interface MetricBucket {
    year: number
    rank: number
    percentageQuestion: number
}

export interface ToolData extends Record<MetricId, MetricBucket[]> {
    id: string
    entity: Entity
    usage: MetricBucket[]
    awareness: MetricBucket[]
    interest: MetricBucket[]
    satisfaction: MetricBucket[]
}

export interface ToolsExperienceRankingBlockProps {
    block: BlockDefinition
    triggerId: MetricId
    data: ToolRatiosQuestionData
    titleProps: any
}

const processBlockData = (
    data: ToolRatiosQuestionData,
    options: { controlledMetric: any; entities: Entity[] }
) => {
    const { controlledMetric, entities } = options
    return data?.items?.map(tool => {
        return {
            id: tool.id,
            name: getEntityName(entities.find(e => e.id === tool.id)),
            data: tool[controlledMetric]
                ?.filter(bucket => bucket.rank && bucket.percentageQuestion)
                .map(bucket => {
                    return {
                        x: bucket.year,
                        y: bucket.rank,
                        percentageQuestion: bucket.percentageQuestion
                    }
                })
        }
    })
}

export const ToolsExperienceRankingBlock = ({
    block,
    data,
    triggerId
}: ToolsExperienceRankingBlockProps) => {
    const { defaultUnits = 'satisfaction', availableUnits } = block

    const [metric, setMetric] = useState<MetricId>(defaultUnits)
    const { getString } = useI18n()
    const entities = useEntities()
    const controlledMetric = triggerId || metric

    const { years, items } = data
    const chartData: RankingChartSerie[] = processBlockData(data, { controlledMetric, entities })

    const tableData = items.map(tool => {
        const cellData = { label: tool?.entity?.name }
        Object.values(RatiosUnits).forEach(metric => {
            cellData[`${metric}_percentage`] = tool[metric]?.map(y => ({
                year: y.year,
                value: y.percentageQuestion
            }))
            cellData[`${metric}_rank`] = tool[metric]?.map(y => ({
                year: y.year,
                value: y.rank
            }))
        })
        return cellData
    })

    const { chartFilters, setChartFilters } = useChartFilters({
        block,
        options: { supportedModes: [MODE_GRID], enableYearSelect: false }
    })

    return (
        <Block
            block={block}
            // titleProps={{ switcher: <Switcher setMetric={setMetric} metric={controlledMetric} /> }}
            data={data}
            modeProps={{
                units: controlledMetric,
                options: availableUnits || Object.values(RatiosUnits),
                onChange: setMetric,
                i18nNamespace: 'options.experience_ranking'
            }}
            tables={[
                getTableData({
                    data: tableData,
                    valueKeys: Object.values(RatiosUnits).map(m => `${m}_rank`),
                    years
                })
            ]}
            chartFilters={chartFilters}
            setChartFilters={setChartFilters}
        >
            <DynamicDataLoader
                defaultData={data}
                block={block}
                chartFilters={chartFilters}
                layout="grid"
            >
                <ChartContainer height={items.length * 50 + 80}>
                    <RankingChart
                        buckets={data}
                        processBlockData={processBlockData}
                        processBlockDataOptions={{ controlledMetric, entities }}
                    />
                </ChartContainer>
            </DynamicDataLoader>
        </Block>
    )
}

export default ToolsExperienceRankingBlock
