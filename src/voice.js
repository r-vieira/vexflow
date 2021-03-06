// Vex Music Notation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010

// TODO: Add preFormat()... then getLargestTickWidth()

/** @constructor */
Vex.Flow.Voice = function(time) {
  this.init(time);
}

// Modes allow the addition of ticks in three different ways:
//
// STRICT: This is the default. Ticks must fill the voice.
// SOFT:   Ticks can be added without restrictions.
// FULL:   Ticks do not need to fill the voice, but can't exceed the maximum
//         tick length.
Vex.Flow.Voice.Mode = {
  STRICT: 1,
  SOFT:   2,
  FULL:   3
}

Vex.Flow.Voice.prototype.init = function(time) {
  this.time = time;

  // Recalculate total ticks.
  this.totalTicks = this.time.num_beats *
    (this.time.resolution / this.time.beat_value);

  // Set defaults
  this.tickables = [];
  this.ticksUsed = 0;
  this.smallestTickCount = this.totalTicks;
  this.largestTickWidth = 0;
  // Do we care about strictly timed notes
  this.mode = Vex.Flow.Voice.Mode.STRICT;

  // This must belong to a VoiceGroup
  this.voiceGroup = null;
}

// Every tickable must be associated with a voiceGroup. This allows formatters
// and preformatters to associate them with the right modifierContexts.
Vex.Flow.Voice.prototype.getVoiceGroup = function() {
  if (!this.voiceGroup)
    throw new Vex.RERR("NoVoiceGroup", "No voice group for voice.");
  return this.voiceGroup;
}

Vex.Flow.Voice.prototype.setVoiceGroup = function(g) {
  this.voiceGroup = g;
  return this;
}

Vex.Flow.Voice.prototype.setStrict = function(strict) {
  this.mode = strict ? Vex.Flow.Voice.Mode.STRICT : Vex.Flow.Voice.Mode.SOFT;
  return this;
}

Vex.Flow.Voice.prototype.setMode = function(mode) {
  this.mode = mode;
  return this;
}

Vex.Flow.Voice.prototype.getMode = function() {
  return this.mode;
}

Vex.Flow.Voice.prototype.isComplete = function() {
  if (this.mode == Vex.Flow.Voice.Mode.STRICT ||
      this.mode == Vex.Flow.Voice.Mode.FULL) {
    return this.ticksUsed == this.totalTicks
  } else {
    return true;
  }
}

Vex.Flow.Voice.prototype.getTotalTicks = function() {
  return this.totalTicks;
}

Vex.Flow.Voice.prototype.getTicksUsed = function() {
  return this.ticksUsed;
}

Vex.Flow.Voice.prototype.getLargestTickWidth = function() {
  return this.largestTickWidth;
}

Vex.Flow.Voice.prototype.getSmallestTickCount = function() {
  return this.smallestTickCount;
}

Vex.Flow.Voice.prototype.getTickables = function() {
  return this.tickables;
}

Vex.Flow.Voice.prototype.addTickable = function(tickable) {
  var time = this.time;

  if (!tickable.shouldIgnoreTicks()) {
    var numTicks = tickable.getTicks();

    // Update the total ticks for this line
    this.ticksUsed += numTicks;

    if ((this.mode == Vex.Flow.Voice.Mode.STRICT ||
         this.mode == Vex.Flow.Voice.Mode.FULL) &&
         this.ticksUsed > this.totalTicks) {
      this.totalTicks -= numTicks;
      throw new Vex.RERR("BadArgument", "Too many ticks.");
    }

    // Track the smallest tickable for formatting
    if (numTicks < this.smallestTickCount)
      this.smallestTickCount = numTicks;
  }

  /* Can't do this without formatting modifier context

  // Track the largest tickable width for formatting
  var width = tickable.getWidth();
  if (width > this.largestTickWidth) this.largestTickWidth = width;
  */

  // Add the tickable to the line
  this.tickables.push(tickable);
  tickable.setVoice(this);
  return this;
}

Vex.Flow.Voice.prototype.addTickables = function(tickables) {
  for (var i = 0; i < tickables.length; ++i) {
    this.addTickable(tickables[i]);
  }

  return this;
}

Vex.Flow.Voice.prototype.draw = function(context, stave) {
  for (var i = 0; i < this.tickables.length; ++i) {
    this.tickables[i].setContext(context);
    this.tickables[i].setStave(stave);
    this.tickables[i].draw();
  }
}
