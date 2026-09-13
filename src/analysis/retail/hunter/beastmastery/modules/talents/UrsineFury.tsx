import { URSINE_FURY_BEAST_TO_BEAR_SUMMON } from 'analysis/retail/hunter/shared/normalizers/HunterEventLinkNormalizers';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent, HasRelatedEvent, SummonEvent } from 'parser/core/Events';
import { encodeEventSourceString, encodeEventTargetString } from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * When your Bear is summoned, it is joined by 2 Dire Beasts.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/fFABwW13pL4xqtrd#fight=7&type=damage-done&source=158
 */
class UrsineFury extends Analyzer {
  damage = 0;
  activeDireBeasts: string[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.URSINE_FURY_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(SPELLS.DIRE_BEAST_SUMMON),
      this.onDireBeastSummon,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
  }

  onDireBeastSummon(event: SummonEvent) {
    if (!HasRelatedEvent(event, URSINE_FURY_BEAST_TO_BEAR_SUMMON)) {
      return;
    }
    const targetId = encodeEventTargetString(event);
    if (!targetId) {
      return;
    }
    this.activeDireBeasts.push(targetId);
  }

  onPetDamage(event: DamageEvent) {
    const sourceId = encodeEventSourceString(event);
    if (!sourceId) {
      return;
    }
    if (this.activeDireBeasts.includes(sourceId)) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.URSINE_FURY_TALENT}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default UrsineFury;
