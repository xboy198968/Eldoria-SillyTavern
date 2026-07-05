// Moon_Combat.js - 战斗引擎
class MoonCombat {
  constructor(core) {
    this.core = core;
  }

  rollD20() {
    return Math.floor(Math.random() * 20) + 1;
  }

  calculateDamage(attacker, defender, skillMultiplier = 1, environment = null) {
    const d20 = this.rollD20();
    const breedPower = (attacker.breedAbility || 50) * 0.6;
    const professionPower = (attacker.professionPower || 50) * 0.4;
    const baseDamage = (breedPower + professionPower) * skillMultiplier;
    let modifier = 1 + (d20 / 20);
    if (d20 === 20) modifier = 2;
    if (d20 === 1) modifier = -0.5;
    const defense = (defender.breedAbility || 50) * 0.3;
    let envBonus = 1;
    if (environment === 'forest') envBonus = 1.15;
    if (environment === 'desert') envBonus = 1.2;
    if (environment === 'swamp') envBonus = 1.1;
    let finalDamage = Math.max(0, baseDamage * modifier * envBonus - defense);
    return {
      d20, critical: d20 === 20, fumble: d20 === 1,
      baseDamage: Math.round(baseDamage), modifier: Math.round(modifier * 100) / 100,
      defense: Math.round(defense), finalDamage: Math.round(finalDamage), environment
    };
  }

  executeCombat(playerTeam, enemyTeam, environment = 'normal') {
    const results = [];
    for (const attacker of playerTeam) {
      if (!attacker.active) continue;
      for (const defender of enemyTeam) {
        if (defender.hp <= 0) continue;
        const result = this.calculateDamage(attacker, defender, 1, environment);
        results.push({ attacker: attacker.name, defender: defender.name, ...result });
        defender.hp -= result.finalDamage;
      }
    }
    return { round: 1, results, environment };
  }

  formatResult(result) {
    const emoji = result.d20 === 20 ? '🎲✨' : result.d20 === 1 ? '🎲💥' : '🎲';
    return emoji + ' D20=' + result.d20 + ' → 伤害 ' + result.finalDamage + (result.critical ? ' (暴击!)' : result.fumble ? ' (大失败!)' : '');
  }
}

window.MoonCombat = MoonCombat;
console.log('MoonCombat loaded');
