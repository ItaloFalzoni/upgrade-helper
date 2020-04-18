import React, { Component, Fragment } from 'react'
import styled from '@emotion/styled'
import { UpOutlined, DownOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import AnimateHeight from 'react-animate-height'
import { getVersionsInDiff, getChangelogURL } from '../../utils'
import { Link } from './Markdown'
import UpgradeSupportAlert from './UpgradeSupportAlert'
import AppNameWarning from './AppNameWarning'

const Container = styled.div`
  position: relative;
  margin-top: 16px;
  color: rgba(0, 0, 0, 0.65);
  overflow: hidden;
`

const InnerContainer = styled.div`
  color: rgba(0, 0, 0, 0.65);
  background-color: #fffbe6;
  border-width: 1px;
  border-left-width: 7px;
  border-color: #ffe58f;
  border-style: solid;
  border-radius: 3px;
  transition: padding 0.25s ease-out;
`

const Title = styled.h2`
  font-size: 17px;
  cursor: pointer;
  margin: 0px;
  padding: 18px 0px 0px 14px;
  ${({ isContentVisible }) =>
    !isContentVisible && 'transform: translate(-5px, -10px);'}
  transition: transform 0.250s ease-out;
`

const ContentContainer = styled(({ isContentVisible, className, ...props }) => (
  <AnimateHeight
    duration={500}
    height={isContentVisible ? 'auto' : 0}
    contentClassName={className}
    {...props}
  />
))`
  display: block !important; // Needed for the opacity animation
  padding: 15px 24px 19px;
  opacity: 1;
  ${({ isContentVisible }) =>
    !isContentVisible &&
    `
      opacity: 0;
      transform: translateY(-20px);
    `}
  transition: opacity 0.250s ease-out 0.150s, transform 0.250s ease-out;
`

const Icon = styled(props => (
  <span {...props} role="img" aria-label="Megaphone emoji">
    📣
  </span>
))`
  margin: 0px 10px;
`

const HideContentButton = styled(
  ({ toggleContentVisibility, isContentVisible, ...props }) => (
    <Button
      {...props}
      type="link"
      icon={isContentVisible ? <UpOutlined /> : <DownOutlined />}
      onClick={toggleContentVisibility}
    />
  )
)`
  float: right;
  position: absolute;
  top: 11px;
  right: 12px;
  font-size: 12px;
  border-width: 0px;
  width: 20px;
  height: 20px;
  color: rgba(0, 0, 0, 0.45);
  &:hover,
  &:focus {
    color: #24292e;
  }
`

const Separator = styled.hr`
  margin: 15px 0;
  background-color: #e1e4e8;
  height: 0.25em;
  border: 0;
`

const List = styled.ol`
  padding-inline-start: 18px;
  margin: 10px 0 0;
`

class UsefulContentSection extends Component {
  state = {
    isContentVisible: true
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Only re-render component if it has reloaded the diff on the parent
    const hasLoaded = this.props.isLoading && !nextProps.isLoading
    // or if the content has been hidden
    const hasContentBeenHidden =
      this.state.isContentVisible !== nextState.isContentVisible

    return hasLoaded || hasContentBeenHidden
  }

  handleToggleContentVisibility = () =>
    this.setState(({ isContentVisible }) => ({
      isContentVisible: !isContentVisible
    }))

  render() {
    const { fromVersion, toVersion } = this.props
    const { isContentVisible } = this.state

    const versions = getVersionsInDiff({ fromVersion, toVersion })
    const doesAnyVersionHaveUsefulContent = versions.some(
      ({ usefulContent }) => !!usefulContent
    )

    if (!doesAnyVersionHaveUsefulContent) {
      return null
    }

    const hasMoreThanOneRelease = versions.length > 1

    return (
      <Container isContentVisible={isContentVisible}>
        <InnerContainer isContentVisible={isContentVisible}>
          <Title
            isContentVisible={isContentVisible}
            onClick={this.handleToggleContentVisibility}
          >
            <Icon /> Useful content for upgrading
          </Title>

          <HideContentButton
            isContentVisible={isContentVisible}
            toggleContentVisibility={this.handleToggleContentVisibility}
          />

          <ContentContainer isContentVisible={isContentVisible}>
            {versions.map(({ usefulContent, version }, key) => {
              const versionWithoutEndingZero = version.slice(0, 4)

              const links = [
                ...usefulContent.links,
                {
                  title: `React Native ${versionWithoutEndingZero} changelog`,
                  url: getChangelogURL({ version: versionWithoutEndingZero })
                }
              ]

              return (
                <Fragment key={key}>
                  {key > 0 && <Separator />}

                  {hasMoreThanOneRelease && (
                    <h3>Release {versionWithoutEndingZero}</h3>
                  )}

                  <span>{usefulContent.description}</span>

                  <List>
                    {links.map(({ url, title }, key) => (
                      <li key={`${url}${key}`}>
                        <Link href={url}>{title}</Link>
                      </li>
                    ))}
                  </List>
                </Fragment>
              )
            })}

            <UpgradeSupportAlert />

            <Separator />

            <AppNameWarning />
          </ContentContainer>
        </InnerContainer>
      </Container>
    )
  }
}

export default UsefulContentSection
