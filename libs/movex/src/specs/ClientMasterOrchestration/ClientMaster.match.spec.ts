import { movexClientMasterOrchestrator } from '../util/orchestrator';
import matchReducer, { initialMatchState } from '../resources/matchReducer';
import { tillNextTick } from 'movex-core-util';
import { computeCheckedState } from '../../lib/util';
require('console-group').install();

const orchestrator = movexClientMasterOrchestrator();

beforeEach(async () => {
  await orchestrator.unsubscribe();
});

test('works', async () => {
  const whiteClientId = 'white-client';
  const blackClientId = 'black-client';
  const [whiteClient, blackClient] = orchestrator.orchestrate({
    clientIds: [whiteClientId, 'black-client'],
    reducer: matchReducer,
    resourceType: 'game',
  });

  const { rid } = await whiteClient.create(initialMatchState).resolveUnwrap();

  const whiteMovex = whiteClient.bind(rid);
  const blackMovex = blackClient.bind(rid);

  whiteMovex.dispatch({
    type: 'addPlayer',
    payload: {
      playerId: whiteClientId,
    },
  });

  blackMovex.dispatch({
    type: 'addPlayer',
    payload: {
      playerId: blackClientId,
    }
  })

  await tillNextTick();

  const expected = computeCheckedState({
    ...initialMatchState,
    players: {
      [whiteClientId]: true,
      [blackClientId]: true
    },
  });

  const actual = whiteMovex.state;

  expect(actual).toEqual(expected);
});
