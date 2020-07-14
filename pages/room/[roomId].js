import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'next/router'

class Room extends React.Component {
  constructor (props) {
    super()
  }

  render () {
    const { dispatch, pokeNo, pokeData, router } = this.props
    const { query } = router
    const { roomId } = query

    return (
      <div>
        {roomId}
      </div>
    )
  }
}

export default connect(({
  pokeReducer
}) => ({
  pokeNo: pokeReducer.get('pokeNo'),
  pokeData: pokeReducer.get('pokeData')
}))(withRouter(Room))
