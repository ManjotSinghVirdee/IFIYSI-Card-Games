const GamePhase = require('../../../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Play a Jack via a seven',

  description: 'Returns new GameState resulting from requested move',

  inputs: {
    currentState: {
      type: 'ref',
      description: 'The latest gameState before playing Jack from the seven',
      required: true,
    },
    /**
     * @param { Object } requestedMove - The move being requested.
     * @param { String } requestedMove.cardId - Card Played (Jack)
     * @param { String } [ requestedMove.targetId ] - Opponent's point card targeted by the jack
     */
    requestedMove: {
      type: 'ref',
      description: 'The move being requested',
      required: true,
    },
    playedBy: {
      type: 'number',
      description: '0 or 1 for whether p0 or p1 is making the move',
      required: true,
    },
  },
  sync: true,

  fn: ({ currentState, requestedMove, playedBy }, exits) => {
    let result = _.cloneDeep(currentState);

    const { cardId, targetId } = requestedMove;

    const player = playedBy ? result.p1 : result.p0;
    const opponent = playedBy ? result.p0 : result.p1;

    const cardIndex = result.deck.findIndex(({ id }) => id === cardId);
    const targetIndex = opponent.points.findIndex(({ id }) => id === targetId);

    // Remove card from the deck
    const [ playedCard ] = result.deck.splice(cardIndex, 1);

    // Remove target card from oppponent's points
    const [ targetCard ] = opponent.points.splice(targetIndex, 1);

    // Add jack (playedCard) to targetCard's attachment
    targetCard.attachments.push(playedCard);

    // Add targetCard to player's points
    player.points.push(targetCard);
    // Scrap oneOff
    const { oneOff } = result;
    result.scrap.push(oneOff);

    result.turn++;

    result = {
      ...result,
      ...requestedMove,
      phase: GamePhase.MAIN,
      playedBy,
      playedCard,
      targetCard,
      discardedCards: [],
      resolved: oneOff,
      oneOff: null,
    };

    return exits.success(result);
  },
};