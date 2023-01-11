import React, { useState } from 'react'
import Block from 'core/blocks/block/BlockVariant'
import HorizontalBarChart from 'core/charts/generic/HorizontalBarChart'
import { getTableData } from 'core/helpers/datatables'
import { ResultsByYear, BlockComponentProps } from 'core/types'
import styled from 'styled-components'
import Avatar from 'core/components/Avatar'
import SocialLinks from 'core/blocks/people/SocialLinks'
import { spacing, mq, fontSize } from 'core/theme'
import T from 'core/i18n/T'

export interface PeopleBlockProps extends BlockComponentProps {
    data: ResultsByYear
}

const PeopleBlock = ({ block, data, controlledUnits, isCustom }: PeopleBlockProps) => {
    const {
        id,
        mode = 'relative',
        defaultUnits = 'count',
        translateData,
        chartNamespace = block.blockNamespace ?? block.id,
        colorVariant
    } = block

    const [units, setUnits] = useState(defaultUnits)

    const { facets, completion } = data
    const buckets = facets[0].buckets
    const { total } = completion

    return (
        <Block
            units={controlledUnits ?? units}
            setUnits={setUnits}
            data={data}
            tables={[
                getTableData({
                    data: buckets,
                    valueKeys: ['percentage_survey', 'percentage_question', 'count'],
                    translateData,
                    i18nNamespace: chartNamespace
                })
            ]}
            block={block}
            completion={completion}
        >
            <Heading_>
                <HName_>
                    <T k="blocks.people.name" />
                </HName_>
                {/* <HLinks_>
                    <T k="blocks.people.social_links" />
                </HLinks_> */}
                <HResponses_>
                    <T k="blocks.people.responses" />
                </HResponses_>
            </Heading_>
            <List_>
                {buckets.map((b, index) => (
                    <PeopleItem
                        key={b.id}
                        {...b}
                        index={index}
                        maxCount={buckets[0].count}
                        units={units}
                    />
                ))}
            </List_>
        </Block>
    )
}

const PeopleItem = ({
    index,
    count,
    maxCount,
    entity,
    id,
    percentage_survey,
    percentage_question,
    units
}) => {
    if (!entity) {
        return <div>no entity found for id {id}</div>
    }
    const isTop10 = index < 10
    const avatarSize = 40

    const getNumber = () => {
        switch (units) {
            case 'percentage_question':
                return percentage_question + '%'

            case 'percentage_survey':
                return percentage_survey + '%'

            case 'count':
            default:
                return count
        }
    }

    return (
        <Item_ className={isTop10 ? 'top10' : ''}>
            <Bar_>
                <BarInner_ style={{ width: `${Math.round((count * 100) / maxCount)}%` }} />
            </Bar_>
            <Index_>
                <span>#{index + 1}</span>
            </Index_>

            <Contents_>
                <Avatar entity={entity} size={avatarSize} />
                <Person_>
                    <Name_>{entity.name}</Name_>
                    <Links_>
                        <SocialLinks entity={entity} />
                    </Links_>
                </Person_>
                <Count_>{getNumber()}</Count_>
            </Contents_>
        </Item_>
    )
}

const List_ = styled.div`
    display: grid;
`

const Item_ = styled.div`
    margin-bottom: ${spacing(0.5)};
    position: relative;
`

const Index_ = styled.div`
    position: absolute;
    left: -50px;
    width: 40px;
    text-align: right;
    font-size: ${fontSize('medium')};
    top: 0;
    bottom: 0;
    display: grid;
    place-items: center;
    .top10 & {
        /* font-size: ${fontSize('large')}; */
    }
    @media ${mq.small} {
        display: none;
    }
    span {
        display: block;
        width: 100%;
    }
`

const Bar_ = styled.div`
    background: rgba(255, 255, 255, 0.05);
    background: ${({ theme }) => theme.colors.backgroundAlt};
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
`

const BarInner_ = styled.div`
    background: rgba(255, 255, 255, 0.05);
    background: ${({ theme }) => theme.colors.backgroundAlt};
    height: 100%;
`

const Heading_ = styled.div`
    margin-bottom: ${spacing(0.5)};
    display: flex;
    justify-content: space-between;
`

const H_ = styled.h4`
    margin: 0;
`

const HName_ = styled(H_)``

const HLinks_ = styled(H_)``

const HResponses_ = styled(H_)`
    text-align: right;
`

const Contents_ = styled.div`
    display: grid;
    align-items: center;
    grid-column-gap: ${spacing(0.5)};
    width: 100%;
    padding: ${spacing(0.25)};
    position: relative;
    z-index: 5;
    @media ${mq.small} {
        grid-template-columns: min-content 1fr min-content;
    }
    @media ${mq.mediumLarge} {
        grid-template-columns: min-content 1fr 50px;
    }
`

const Person_ = styled.div`
    @media ${mq.small} {
        display: flex;
        flex-direction: column;
        gap: ${spacing(0.25)};
        flex: 1;
    }
    @media ${mq.mediumLarge} {
        display: grid;
        grid-template-columns: 2fr 1fr;
        align-items: center;
    }
`

const Name_ = styled.div`
    white-space: nowrap;
    font-size: ${fontSize('smallish')};
    @media ${mq.small} {
        overflow: hidden;
        text-overflow: ellipsis;
    }
`

const Links_ = styled.div`
    display: flex;
    justify-content: flex-start;
    @media ${mq.small} {
        overflow-x: auto;
        width: 100%;
    }
`

const Count_ = styled.div`
    text-align: right;
    padding: 0 ${spacing(0.5)};
    font-size: ${fontSize('medium')};
`

export default PeopleBlock
